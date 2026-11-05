import {
  clamp,
  formatBoardDate,
  formatDistance,
  formatDuration,
  formatScore,
  initialsFor,
  padScore,
} from "@/lib/format";

describe("score formatting", () => {
  it("formats and pads leaderboard scores", () => {
    expect(formatScore(12960)).toBe("12,960");
    expect(padScore(42)).toBe("000042");
    expect(padScore(1234567, 4)).toBe("1234567");
  });

  it("formats metres and kilometres", () => {
    expect(formatDistance(845)).toBe("845 m");
    expect(formatDistance(1540)).toBe("1.5 km");
  });

  it("formats durations as minutes and seconds", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(125)).toBe("2:05");
  });

  it("derives initials from callsigns", () => {
    expect(initialsFor("NOVA")).toBe("NO");
    expect(initialsFor("IRON REX")).toBe("IR");
    expect(initialsFor("")).toBe("??");
  });

  it("formats board dates and guards invalid values", () => {
    expect(formatBoardDate("2026-11-04T18:22:00.000Z")).toContain("Nov");
    expect(formatBoardDate("not-a-date")).toBe("—");
  });

  it("clamps values into a range", () => {
    expect(clamp(-4, 0, 10)).toBe(0);
    expect(clamp(14, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });
});
