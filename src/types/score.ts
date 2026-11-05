export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  distance: number;
  shards: number;
  createdAt: string;
}

export type ScoreSource = "database" | "none";

export interface ScoresResponse {
  scores: ScoreEntry[];
  source: ScoreSource;
  configured: boolean;
  degraded?: boolean;
  notice?: string;
}

export interface SaveScoreResponse {
  entry: ScoreEntry;
  rank: number;
  retained: true;
}
