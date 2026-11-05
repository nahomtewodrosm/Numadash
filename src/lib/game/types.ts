export type Lane = -1 | 0 | 1;
export type GameStatus = "idle" | "running" | "paused" | "over";
export type ObstacleKind = "cactus" | "bird";
export type GameEvent =
  | "start"
  | "jump"
  | "lane"
  | "duck"
  | "shard"
  | "crash"
  | "pause"
  | "resume";

export interface Obstacle {
  id: number;
  kind: ObstacleKind;
  lane: Lane;
  z: number;
  height: number;
  variant: number;
}

export interface Shard {
  id: number;
  lane: Lane;
  z: number;
  y: number;
  phase: number;
}

export interface HudSnapshot {
  status: GameStatus;
  score: number;
  distance: number;
  shards: number;
  speed: number;
  lane: Lane;
  elapsed: number;
}

export interface RunSummary {
  score: number;
  distance: number;
  shards: number;
  duration: number;
  topSpeed: number;
}

export interface RunnerCallbacks {
  onHud?: (snapshot: HudSnapshot) => void;
  onGameOver?: (summary: RunSummary) => void;
  onEvent?: (event: GameEvent) => void;
}

export interface PlayerCollisionBox {
  lane: Lane;
  bottom: number;
  top: number;
  z: number;
  halfDepth: number;
}
