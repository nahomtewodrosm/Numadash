import { Schema, model, models, type Model } from "mongoose";

export interface ScoreRecord {
  name: string;
  score: number;
  distance: number;
  shards: number;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

const scoreSchema = new Schema<ScoreRecord>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 12,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10_000_000,
      index: true,
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
      max: 10_000_000,
    },
    shards: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100_000,
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 86_400,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

scoreSchema.index({ score: -1, createdAt: 1 });
scoreSchema.index({ name: 1, score: -1, createdAt: 1 });

export const ScoreModel: Model<ScoreRecord> =
  (models.Score as Model<ScoreRecord> | undefined) ??
  model<ScoreRecord>("Score", scoreSchema);
