import { NextResponse } from "next/server";
import { isMongoConfigured } from "@/lib/mongodb";
import { getTopScores, saveScore } from "@/lib/scores";
import { scoreSubmissionSchema, toFieldErrors } from "@/lib/validation";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 6;
const buckets = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "local";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

export async function GET() {
  const headers = { "Cache-Control": "no-store" };

  if (!isMongoConfigured()) {
    return NextResponse.json(
      {
        scores: [],
        source: "none",
        configured: false,
        notice: "The score database is not configured. Global records are unavailable.",
      },
      { headers },
    );
  }

  try {
    const scores = await getTopScores(8);
    return NextResponse.json(
      {
        scores,
        source: "database",
        configured: true,
      },
      { headers },
    );
  } catch (error) {
    console.error("Failed to load scores", error);
    return NextResponse.json(
      {
        scores: [],
        source: "none",
        configured: true,
        degraded: true,
        notice: "The database is unreachable. Global records are unavailable.",
      },
      { headers },
    );
  }
}

export async function POST(request: Request) {
  const key = getClientKey(request);

  if (isRateLimited(key)) {
    return NextResponse.json(
      { error: "Too many runs submitted. Try again in a minute." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (!isMongoConfigured()) {
    return NextResponse.json(
      {
        error:
          "The score database is not connected. Configure the score service, then restart the server.",
      },
      { status: 503 },
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 2_048) {
    return NextResponse.json(
      { error: "Request body is too large." },
      { status: 413 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = scoreSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "That run did not pass validation.",
        fieldErrors: toFieldErrors(parsed.error),
      },
      { status: 422 },
    );
  }

  try {
    const result = await saveScore(parsed.data);
    if (!result.retained) {
      return NextResponse.json(
        {
          error:
            "Only your two highest scores are kept. This run did not beat your second-best score.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Failed to save score", error);
    return NextResponse.json(
      { error: "Could not save this run. Please try again." },
      { status: 500 },
    );
  }
}
