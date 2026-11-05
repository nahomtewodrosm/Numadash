import {
  BASE_SPEED,
  JUMP_VELOCITY,
  RunnerEngine,
  collidesWithPlayer,
} from "@/lib/game/engine";
import type { Obstacle, Shard } from "@/lib/game/types";

const fixedRandom = () => 0.5;

function makeEngine() {
  const onGameOver = jest.fn();
  const onHud = jest.fn();
  const onEvent = jest.fn();
  const engine = new RunnerEngine({
    random: fixedRandom,
    onGameOver,
    onHud,
    onEvent,
  });

  return { engine, onGameOver, onHud, onEvent };
}

function step(engine: RunnerEngine, seconds: number, fps = 60) {
  const frames = Math.ceil(seconds * fps);
  for (let frame = 0; frame < frames; frame += 1) {
    engine.update(1 / fps);
  }
}

function cactus(overrides: Partial<Obstacle> = {}): Obstacle {
  return {
    id: 1,
    kind: "cactus",
    lane: 0,
    z: 0,
    height: 1.4,
    variant: 1,
    ...overrides,
  };
}

describe("RunnerEngine", () => {
  it("starts with a clean running state and emits start audio", () => {
    const { engine, onEvent } = makeEngine();

    engine.start();

    expect(engine.status).toBe("running");
    expect(engine.score).toBe(0);
    expect(engine.lane).toBe(0);
    expect(engine.obstacles).toHaveLength(0);
    expect(onEvent).toHaveBeenCalledWith("start");
  });

  it("accumulates distance, score and speed over time", () => {
    const { engine, onHud } = makeEngine();
    engine.start();

    step(engine, 2);

    expect(engine.distance).toBeGreaterThan(25);
    expect(engine.score).toBeGreaterThan(30);
    expect(engine.speed).toBeGreaterThan(BASE_SPEED);
    expect(onHud).toHaveBeenCalled();
    expect(onHud.mock.calls.at(-1)?.[0].status).toBe("running");
  });

  it("clamps lane changes to the three playable lanes", () => {
    const { engine, onEvent } = makeEngine();
    engine.start();

    expect(engine.moveLane(-1)).toBe(true);
    expect(engine.lane).toBe(-1);
    expect(engine.moveLane(-1)).toBe(false);
    expect(engine.lane).toBe(-1);

    engine.moveLane(1);
    engine.moveLane(1);
    expect(engine.lane).toBe(1);
    expect(onEvent).toHaveBeenCalledWith("lane");
  });

  it("jumps and lands under gravity", () => {
    const { engine, onEvent } = makeEngine();
    engine.start();

    expect(engine.jump()).toBe(true);
    expect(engine.jumpVelocity).toBe(JUMP_VELOCITY);
    step(engine, 0.2);
    expect(engine.jumpY).toBeGreaterThan(1);

    step(engine, 1.5);
    expect(engine.jumpY).toBe(0);
    expect(engine.jumpVelocity).toBe(0);
    expect(onEvent).toHaveBeenCalledWith("jump");
  });

  it("does not start a second jump while airborne", () => {
    const { engine } = makeEngine();
    engine.start();
    engine.jump();
    step(engine, 0.1);

    expect(engine.jump()).toBe(false);
  });

  it("collects a middle-height shard without jumping or ducking", () => {
    const { engine, onEvent } = makeEngine();
    engine.start();
    const shard: Shard = {
      id: 99,
      lane: 0,
      z: 0,
      y: 1.35,
      phase: 0,
    };
    engine.shards = [shard];

    engine.update(1 / 60);

    expect(engine.jumpY).toBe(0);
    expect(engine.ducking).toBe(false);
    expect(engine.shardsCollected).toBe(1);
    expect(engine.shards).toHaveLength(0);
    expect(engine.score).toBeGreaterThanOrEqual(50);
    expect(onEvent).toHaveBeenCalledWith("shard");
  });

  it("keeps spawned shards in a clear, reachable lane", () => {
    const { engine } = makeEngine();
    engine.start();

    for (let frame = 0; frame < 60 * 4.5; frame += 1) {
      engine.update(1 / 60);
      for (const shard of engine.shards) {
        expect([-1, 0, 1]).toContain(shard.lane);
        expect(shard.y).toBe(1.35);
        for (const obstacle of engine.obstacles) {
          if (obstacle.lane === shard.lane) {
            expect(Math.abs(obstacle.z - shard.z)).toBeGreaterThanOrEqual(8);
          }
        }
      }
    }

    expect(engine.shards.length).toBeGreaterThan(0);
  });

  it("pauses without advancing the world, then resumes", () => {
    const { engine, onEvent } = makeEngine();
    engine.start();
    step(engine, 0.5);

    const pausedDistance = engine.distance;
    expect(engine.pause()).toBe(true);
    expect(engine.status).toBe("paused");
    step(engine, 1);
    expect(engine.distance).toBe(pausedDistance);

    expect(engine.resume()).toBe(true);
    expect(engine.status).toBe("running");
    step(engine, 0.5);
    expect(engine.distance).toBeGreaterThan(pausedDistance);
    expect(onEvent).toHaveBeenCalledWith("pause");
    expect(onEvent).toHaveBeenCalledWith("resume");
  });

  it("ends the run on a collision and returns a summary", () => {
    const { engine, onGameOver } = makeEngine();
    engine.start();

    // With a fixed random source the runner never changes lanes, so the
    // first deterministic cactus is guaranteed to end this run.
    step(engine, 12);

    expect(engine.status).toBe("over");
    expect(onGameOver).toHaveBeenCalledTimes(1);
    const summary = onGameOver.mock.calls[0][0];
    expect(summary.score).toBeGreaterThan(0);
    expect(summary.distance).toBeGreaterThan(0);
    expect(summary.topSpeed).toBeGreaterThan(0);
  });

  it("resets all transient state on restart", () => {
    const { engine } = makeEngine();
    engine.start();
    engine.moveLane(1);
    engine.setDucking(true);
    step(engine, 1);

    engine.start();

    expect(engine.status).toBe("running");
    expect(engine.score).toBe(0);
    expect(engine.distance).toBe(0);
    expect(engine.lane).toBe(0);
    expect(engine.ducking).toBe(false);
    expect(engine.obstacles).toHaveLength(0);
  });
});

describe("collision rules", () => {
  const standingPlayer = {
    lane: 0 as const,
    bottom: 0,
    top: 2.72,
    z: 0,
    halfDepth: 0.75,
  };

  it("hits a cactus in the same lane", () => {
    expect(collidesWithPlayer(cactus(), standingPlayer)).toBe(true);
  });

  it("clears a cactus while high enough in a jump", () => {
    expect(
      collidesWithPlayer(cactus({ height: 1.4 }), {
        ...standingPlayer,
        bottom: 1.5,
        top: 4.22,
      }),
    ).toBe(false);
  });

  it("ignores obstacles in a different lane", () => {
    expect(
      collidesWithPlayer(cactus({ lane: -1 }), standingPlayer),
    ).toBe(false);
  });

  it("requires ducking under a bird", () => {
    const bird = cactus({ kind: "bird", height: 2.75 });
    expect(collidesWithPlayer(bird, standingPlayer)).toBe(true);
    expect(
      collidesWithPlayer(bird, {
        ...standingPlayer,
        top: 1.32,
      }),
    ).toBe(false);
  });

  it("ignores obstacles far ahead or behind the player", () => {
    expect(collidesWithPlayer(cactus({ z: -8 }), standingPlayer)).toBe(false);
  });
});
