import { connectToDatabase } from "@/lib/mongodb";
import { ScoreModel, type ScoreRecord } from "@/models/Score";
import type { ScoreEntry } from "@/types/score";
import type { ScoreSubmission } from "@/lib/validation";

function toEntry(
  record: ScoreRecord & { _id: unknown },
): ScoreEntry {
  return {
    id: String(record._id),
    name: record.name,
    score: record.score,
    distance: record.distance,
    shards: record.shards,
    createdAt: new Date(record.createdAt).toISOString(),
  };
}

export async function getTopScores(limit = 8): Promise<ScoreEntry[]> {
  await connectToDatabase();

  const records = await ScoreModel.find()
    .sort({ score: -1, createdAt: 1 })
    .limit(Math.min(Math.max(limit, 1), 25))
    .lean()
    .exec();

  return records.map(toEntry);
}

export async function saveScore(
  submission: ScoreSubmission,
): Promise<{ entry: ScoreEntry; rank: number; retained: boolean }> {
  await connectToDatabase();

  const created = await ScoreModel.create(submission);
  const playerScores = await ScoreModel.find({ name: submission.name })
    .sort({ score: -1, createdAt: 1, _id: 1 })
    .select("_id")
    .lean()
    .exec();
  const expiredIds = playerScores.slice(2).map((record) => record._id);
  const retained = !expiredIds.some((id) => String(id) === String(created._id));

  if (expiredIds.length > 0) {
    await ScoreModel.deleteMany({ _id: { $in: expiredIds } }).exec();
  }

  if (!retained) {
    return {
      entry: toEntry(created),
      rank: 0,
      retained: false,
    };
  }

  const rank =
    (await ScoreModel.countDocuments({ score: { $gt: created.score } })) + 1;

  return {
    entry: toEntry(created),
    rank,
    retained: true,
  };
}
