import mongoose from "mongoose";

interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var __numaMongoose: MongooseCache | undefined;
}

const cache: MongooseCache =
  globalThis.__numaMongoose ?? { connection: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  globalThis.__numaMongoose = cache;
}

export function isMongoConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

/**
 * Prefer an explicit MONGODB_DB, then the database in the URI, then the
 * project default. Passing a name to Mongoose avoids falling back to the
 * shared `test` database on cluster URIs that omit a path.
 */
export function getDatabaseName(): string | null {
  if (!process.env.MONGODB_URI) return null;
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;

  try {
    const url = new URL(process.env.MONGODB_URI);
    const fromUri = url.pathname.replace(/^\//, "");
    return fromUri || "numa-run";
  } catch {
    return "numa-run";
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not configured. Add it to .env.local to enable the global leaderboard.",
    );
  }

  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName: getDatabaseName() ?? "numa-run",
      bufferCommands: false,
      serverSelectionTimeoutMS: 8_000,
      maxPoolSize: 10,
    });
  }

  try {
    cache.connection = await cache.promise;
    return cache.connection;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
}
