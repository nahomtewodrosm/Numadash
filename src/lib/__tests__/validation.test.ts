import {
  MAX_SCORE,
  scoreSubmissionSchema,
  toFieldErrors,
} from "@/lib/validation";

const validRun = {
  name: "nova",
  score: 4820,
  distance: 3010,
  shards: 21,
  duration: 90,
};

describe("scoreSubmissionSchema", () => {
  it("normalises a valid callsign to uppercase", () => {
    const result = scoreSubmissionSchema.parse(validRun);
    expect(result.name).toBe("NOVA");
    expect(result.score).toBe(4820);
  });

  it("trims and collapses whitespace in callsigns", () => {
    const result = scoreSubmissionSchema.parse({
      ...validRun,
      name: "  iron   rex  ",
    });
    expect(result.name).toBe("IRON REX");
  });

  it("applies defaults for optional telemetry", () => {
    const result = scoreSubmissionSchema.parse({
      name: "ECHO",
      score: 10,
      distance: 10,
    });
    expect(result.shards).toBe(0);
    expect(result.duration).toBe(0);
  });

  it.each(["A", "", "BAD<script>", "EMOJI🦖", "THISNAMEISTOOLONG"])(
    "rejects invalid callsign %p",
    (name) => {
      expect(
        scoreSubmissionSchema.safeParse({ ...validRun, name }).success,
      ).toBe(false);
    },
  );

  it("rejects negative and impossible scores", () => {
    expect(
      scoreSubmissionSchema.safeParse({ ...validRun, score: -1 }).success,
    ).toBe(false);
    expect(
      scoreSubmissionSchema.safeParse({
        ...validRun,
        score: MAX_SCORE + 1,
      }).success,
    ).toBe(false);
  });

  it("returns field-level errors for form and API feedback", () => {
    const result = scoreSubmissionSchema.safeParse({
      ...validRun,
      name: "!",
      score: -20,
    });
    expect(result.success).toBe(false);
    if (result.success) return;

    const errors = toFieldErrors(result.error);
    expect(errors.name?.[0]).toMatch(/at least 2 characters|letters/i);
    expect(errors.score?.[0]).toBeDefined();
  });
});
