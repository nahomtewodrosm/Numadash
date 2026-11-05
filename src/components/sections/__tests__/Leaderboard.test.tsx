import { render, screen, waitFor } from "@testing-library/react";
import { Leaderboard } from "@/components/sections/Leaderboard";

const scoresResponse = {
  source: "database",
  configured: true,
  scores: [
    {
      id: "run-1",
      name: "NOVA",
      score: 18420,
      distance: 8420,
      shards: 96,
      createdAt: "2026-11-04T18:22:00.000Z",
    },
    {
      id: "run-2",
      name: "RAPTOR",
      score: 15280,
      distance: 7010,
      shards: 74,
      createdAt: "2026-11-04T16:10:00.000Z",
    },
  ],
};

describe("Leaderboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders scores returned by the API", async () => {
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => scoresResponse,
    } as Response);

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText("NOVA")).toBeInTheDocument();
    });
    expect(screen.getByText("RAPTOR")).toBeInTheDocument();
    expect(screen.getByText("Database connected")).toBeInTheDocument();
    expect(screen.getByText("SOURCE / DATABASE")).toBeInTheDocument();
  });

  it("shows no fabricated runs when the API is unreachable", async () => {
    jest.spyOn(global, "fetch").mockRejectedValue(new Error("offline"));

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText("No verified runs yet.")).toBeInTheDocument();
    });
    expect(screen.getByText("Database offline")).toBeInTheDocument();
    expect(
      screen.getByText(
        "The score service is offline. Global records are unavailable.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the locally stored personal best", async () => {
    window.localStorage.setItem("numa-run:best", "9210");
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => scoresResponse,
    } as Response);

    render(<Leaderboard />);

    await waitFor(() => {
      expect(screen.getByText("9,210")).toBeInTheDocument();
    });
  });
});
