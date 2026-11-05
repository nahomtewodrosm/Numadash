import type {
  GameEvent,
  GameStatus,
  HudSnapshot,
  Lane,
  Obstacle,
  ObstacleKind,
  PlayerCollisionBox,
  RunSummary,
  RunnerCallbacks,
  Shard,
} from "./types";

export const LANE_POSITIONS = [-3.25, 0, 3.25] as const;
export const SPAWN_Z = -72;
export const DESPAWN_Z = 7;
export const BASE_SPEED = 15;
export const MAX_SPEED = 38;
export const JUMP_VELOCITY = 12.8;
export const GRAVITY = 32;

const BIRD_BOTTOM = 1.6;
const BIRD_TOP = 2.75;
const STANDING_TOP = 2.72;
const DUCKING_TOP = 1.32;
const CACTUS_HEIGHTS = [1.05, 1.42, 1.82] as const;
const MAX_OBSTACLES = 16;
const SHARD_OBSTACLE_CLEARANCE = 8;
const LANES: Lane[] = [-1, 0, 1];

type RandomSource = () => number;
type EngineOptions = RunnerCallbacks & { random?: RandomSource };

export function laneToX(lane: Lane): number {
  return LANE_POSITIONS[lane + 1];
}

export function collidesWithPlayer(
  obstacle: Obstacle,
  player: PlayerCollisionBox,
): boolean {
  if (obstacle.lane !== player.lane) return false;
  if (
    Math.abs(obstacle.z - player.z) >
    player.halfDepth + 0.55
  ) {
    return false;
  }

  const obstacleBottom = obstacle.kind === "bird" ? BIRD_BOTTOM : 0;
  const obstacleTop = obstacle.kind === "bird" ? BIRD_TOP : obstacle.height;

  return player.bottom < obstacleTop && player.top > obstacleBottom;
}

export class RunnerEngine {
  status: GameStatus = "idle";
  elapsed = 0;
  distance = 0;
  score = 0;
  shardsCollected = 0;
  speed = BASE_SPEED;
  lane: Lane = 0;
  ducking = false;
  jumpY = 0;
  jumpVelocity = 0;
  obstacles: Obstacle[] = [];
  shards: Shard[] = [];

  private topSpeed = BASE_SPEED;
  private nextId = 1;
  private spawnClock = 1.15;
  private shardClock = 0.6;
  private hudClock = 0;
  private readonly random: RandomSource;
  private readonly callbacks: RunnerCallbacks;

  constructor(options: EngineOptions = {}) {
    const { random, ...callbacks } = options;
    this.random = random ?? Math.random;
    this.callbacks = callbacks;
  }

  start(): void {
    this.reset();
    this.status = "running";
    this.spawnClock = 1.15;
    this.shardClock = 0.6;
    this.emitHud(true);
    this.callbacks.onEvent?.("start");
  }

  restart(): void {
    this.start();
  }

  reset(): void {
    this.status = "idle";
    this.elapsed = 0;
    this.distance = 0;
    this.score = 0;
    this.shardsCollected = 0;
    this.speed = BASE_SPEED;
    this.topSpeed = BASE_SPEED;
    this.lane = 0;
    this.ducking = false;
    this.jumpY = 0;
    this.jumpVelocity = 0;
    this.obstacles = [];
    this.shards = [];
    this.nextId = 1;
    this.spawnClock = 1.15;
    this.shardClock = 0.6;
    this.hudClock = 0;
    this.emitHud(true);
  }

  pause(): boolean {
    if (this.status !== "running") return false;
    this.status = "paused";
    this.callbacks.onEvent?.("pause");
    this.emitHud(true);
    return true;
  }

  resume(): boolean {
    if (this.status !== "paused") return false;
    this.status = "running";
    this.callbacks.onEvent?.("resume");
    this.emitHud(true);
    return true;
  }

  jump(): boolean {
    if (this.status !== "running") return false;
    if (this.jumpY > 0.001 || this.jumpVelocity > 0) return false;

    this.ducking = false;
    this.jumpVelocity = JUMP_VELOCITY;
    this.callbacks.onEvent?.("jump");
    return true;
  }

  setDucking(value: boolean): void {
    if (this.status !== "running") return;
    if (this.ducking === value) return;
    this.ducking = value;
    if (value) this.callbacks.onEvent?.("duck");
  }

  moveLane(direction: -1 | 1): boolean {
    if (this.status !== "running") return false;
    const next = Math.max(-1, Math.min(1, this.lane + direction)) as Lane;
    if (next === this.lane) return false;

    this.lane = next;
    this.callbacks.onEvent?.("lane");
    return true;
  }

  getPlayerCollisionBox(): PlayerCollisionBox {
    return {
      lane: this.lane,
      bottom: this.jumpY,
      top: this.jumpY + (this.ducking ? DUCKING_TOP : STANDING_TOP),
      z: 0,
      halfDepth: 0.75,
    };
  }

  update(rawDelta: number): void {
    if (this.status !== "running") return;

    const delta = Math.min(Math.max(rawDelta, 0), 1 / 20);
    if (delta === 0) return;

    this.elapsed += delta;
    this.speed = Math.min(MAX_SPEED, BASE_SPEED + this.elapsed * 0.62);
    this.topSpeed = Math.max(this.topSpeed, this.speed);

    const travel = this.speed * delta;
    this.distance += travel;

    for (const obstacle of this.obstacles) {
      obstacle.z += travel;
    }
    for (const shard of this.shards) {
      shard.z += travel;
    }

    this.updateJump(delta);
    this.spawnClock -= delta;
    this.shardClock -= delta;

    if (this.spawnClock <= 0) {
      this.spawnObstacle();
      this.spawnClock = this.nextObstacleDelay();
    }

    if (this.shardClock <= 0) {
      this.spawnShard();
      this.shardClock = 1.35 + this.random() * 1.65;
    }

    this.obstacles = this.obstacles.filter(
      (obstacle) => obstacle.z < DESPAWN_Z,
    );
    this.shards = this.shards.filter((shard) => shard.z < DESPAWN_Z);
    this.collectShards();

    this.score = Math.floor(this.distance * 1.6) + this.shardsCollected * 50;

    const player = this.getPlayerCollisionBox();
    if (this.obstacles.some((obstacle) => collidesWithPlayer(obstacle, player))) {
      this.end();
      return;
    }

    this.hudClock += delta;
    if (this.hudClock >= 0.08) {
      this.hudClock = 0;
      this.emitHud();
    }
  }

  private updateJump(delta: number): void {
    if (this.jumpY <= 0 && this.jumpVelocity <= 0) return;

    this.jumpVelocity -= GRAVITY * delta;
    this.jumpY += this.jumpVelocity * delta;

    if (this.jumpY <= 0) {
      this.jumpY = 0;
      this.jumpVelocity = 0;
    }
  }

  private spawnObstacle(): void {
    if (this.obstacles.length >= MAX_OBSTACLES) return;

    const z = SPAWN_Z + Math.abs(this.random() * 2);
    const availableLanes = LANES.filter(
      (lane) =>
        !this.shards.some(
          (shard) =>
            shard.lane === lane &&
            Math.abs(shard.z - z) < SHARD_OBSTACLE_CLEARANCE,
        ),
    );
    if (availableLanes.length === 0) return;

    const difficulty = Math.min(1, this.elapsed / 70);
    const birdChance =
      this.elapsed < 10 ? 0 : Math.min(0.3, 0.06 + difficulty * 0.24);

    if (this.random() < birdChance) {
      this.addObstacle(
        "bird",
        this.randomFrom(availableLanes),
        2.75,
        0,
        z,
      );
      return;
    }

    const variant = Math.floor(this.random() * CACTUS_HEIGHTS.length);
    const height = CACTUS_HEIGHTS[variant];

    if (
      difficulty > 0.32 &&
      this.random() < 0.18 &&
      this.obstacles.length < MAX_OBSTACLES - 2 &&
      availableLanes.length === LANES.length
    ) {
      const safeLane = this.randomLane();
      const blocked = LANES.filter((lane) => lane !== safeLane);
      for (const lane of blocked) {
        this.addObstacle("cactus", lane, 1.28, 1, z);
      }
      return;
    }

    this.addObstacle(
      "cactus",
      this.randomFrom(availableLanes),
      height,
      variant,
      z,
    );
  }

  private spawnShard(): void {
    if (this.shards.length >= 7) return;

    const z = SPAWN_Z + Math.abs(this.random() * 3);
    const availableLanes = LANES.filter(
      (lane) =>
        !this.obstacles.some(
          (obstacle) =>
            obstacle.lane === lane &&
            Math.abs(obstacle.z - z) < SHARD_OBSTACLE_CLEARANCE,
        ),
    );
    if (availableLanes.length === 0) return;

    this.shards.push({
      id: this.nextId++,
      lane: this.randomFrom(availableLanes),
      z,
      y: 1.35,
      phase: this.random() * Math.PI * 2,
    });
  }

  private addObstacle(
    kind: ObstacleKind,
    lane: Lane,
    height: number,
    variant: number,
    z = SPAWN_Z + Math.abs(this.random() * 2),
  ): void {
    this.obstacles.push({
      id: this.nextId++,
      kind,
      lane,
      z,
      height,
      variant,
    });
  }

  private collectShards(): void {
    const playerCenterY = this.jumpY + (this.ducking ? 0.7 : 1.35);
    const remaining: Shard[] = [];

    for (const shard of this.shards) {
      const collected =
        shard.lane === this.lane &&
        Math.abs(shard.z) < 1.15 &&
        Math.abs(shard.y - playerCenterY) < 0.95;

      if (collected) {
        this.shardsCollected += 1;
        this.callbacks.onEvent?.("shard");
      } else {
        remaining.push(shard);
      }
    }

    this.shards = remaining;
  }

  private end(): void {
    this.status = "over";
    this.jumpVelocity = 0;
    this.ducking = false;
    this.emitHud(true);
    this.callbacks.onEvent?.("crash");
    this.callbacks.onGameOver?.(this.getSummary());
  }

  getSummary(): RunSummary {
    return {
      score: this.score,
      distance: Math.floor(this.distance),
      shards: this.shardsCollected,
      duration: Math.round(this.elapsed),
      topSpeed: Math.round(this.topSpeed * 3.6),
    };
  }

  private emitHud(force = false): void {
    if (!force && this.status !== "running") return;
    this.callbacks.onHud?.({
      status: this.status,
      score: this.score,
      distance: Math.floor(this.distance),
      shards: this.shardsCollected,
      speed: Math.round(this.speed * 3.6),
      lane: this.lane,
      elapsed: this.elapsed,
    });
  }

  private randomLane(): Lane {
    const roll = this.random();
    if (roll < 1 / 3) return -1;
    if (roll < 2 / 3) return 0;
    return 1;
  }

  private randomFrom<T>(values: readonly T[]): T {
    return values[Math.floor(this.random() * values.length)]!;
  }

  private nextObstacleDelay(): number {
    const base = Math.max(0.58, 1.45 - this.elapsed * 0.012);
    return base * (0.85 + this.random() * 0.3);
  }
}

export function createInitialHud(): HudSnapshot {
  return {
    status: "idle",
    score: 0,
    distance: 0,
    shards: 0,
    speed: Math.round(BASE_SPEED * 3.6),
    lane: 0,
    elapsed: 0,
  };
}

export type { GameEvent };
