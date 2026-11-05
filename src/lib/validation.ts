import { z } from "zod";

export const MAX_SCORE = 10_000_000;

export const scoreSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Callsign must be at least 2 characters.")
    .max(12, "Callsign must be 12 characters or fewer.")
    .regex(
      /^[a-zA-Z0-9 _-]+$/,
      "Use only letters, numbers, spaces, hyphens or underscores.",
    )
    .transform((value) => value.replace(/\s+/g, " ").toUpperCase()),
  score: z.number().int().min(0).max(MAX_SCORE),
  distance: z.number().int().min(0).max(MAX_SCORE),
  shards: z.number().int().min(0).max(100_000).default(0),
  duration: z.number().int().min(0).max(86_400).default(0),
});

export type ScoreSubmission = z.infer<typeof scoreSubmissionSchema>;

export function toFieldErrors(
  error: z.ZodError,
): Record<string, string | undefined> {
  return error.flatten().fieldErrors as Record<string, string | undefined>;
}
