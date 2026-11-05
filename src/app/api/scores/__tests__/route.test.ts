import { GET, POST } from "@/app/api/scores/route";
import { isMongoConfigured } from "@/lib/mongodb";
import { getTopScores, saveScore } from "@/lib/scores";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number; headers?: Record<string, string> },
    ) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
    }),
  },
}));

jest.mock("@/lib/mongodb", () => ({
  isMongoConfigured: jest.fn(),
}));

jest.mock("@/lib/scores", () => ({
  getTopScores: jest.fn(),
  saveScore: jest.fn(),
}));

const configured = jest.mocked(isMongoConfigured);
const fetchTopScores = jest.mocked(getTopScores);
const persistScore = jest.mocked(saveScore);

interface MockResponse {
  status: number;
  headers: Record<string, string>;
  json: () => Promise<Record<string, unknown>>;
}

function request(
  body: unknown,
  {
    ip = "local",
    contentLength,
    malformed = false,
  }: { ip?: string; contentLength?: number; malformed?: boolean } = {},
): Request {
  const headers: Record<string, string> = {
    "x-forwarded-for": ip,
  };
  if (contentLength !== undefined) {
    headers["content-length"] = String(contentLength);
  }

  return {
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
    json: async () => {
      if (malformed) throw new SyntaxError("Unexpected token");
      return body;
    },
  } as unknown as Request;
}

const validRun = {
  name: "nova",
  score: 4820,
  distance: 3010,
  shards: 21,
  duration: 90,
};

const savedEntry = {
  id: "run-1",
  name: "NOVA",
  score: 4820,
  distance: 3010,
  shards: 21,
  createdAt: "2026-11-05T10:00:00.000Z",
};

describe("GET /api/scores", () => {
  it("returns no records when the database is not configured", async () => {
    configured.mockReturnValue(false);

    const response = (await GET()) as unknown as MockResponse;
    const body = await response.json();

    expect(body.source).toBe("none");
    expect(body.configured).toBe(false);
    expect(body.scores).toEqual([]);
    expect(body.notice).toMatch(/not configured/i);
  });

  it("serves database scores when the connection works", async () => {
    configured.mockReturnValue(true);
    fetchTopScores.mockResolvedValue([savedEntry]);

    const response = (await GET()) as unknown as MockResponse;
    const body = await response.json();

    expect(fetchTopScores).toHaveBeenCalledWith(8);
    expect(body.source).toBe("database");
    expect(body.configured).toBe(true);
    expect(body.scores).toEqual([savedEntry]);
  });

  it("returns no records when the database is unreachable", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    configured.mockReturnValue(true);
    fetchTopScores.mockRejectedValue(new Error("connection refused"));

    const response = (await GET()) as unknown as MockResponse;
    const body = await response.json();

    expect(body.source).toBe("none");
    expect(body.configured).toBe(true);
    expect(body.degraded).toBe(true);
    expect(body.notice).toMatch(/unreachable/i);
    expect(body.scores).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
  });
});

describe("POST /api/scores", () => {
  it("explains how to enable persistence when the database is missing", async () => {
    configured.mockReturnValue(false);

    const response = (await POST(
      request(validRun, { ip: "203.0.113.1" }),
    )) as unknown as MockResponse;
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toMatch(/score database/i);
    expect(persistScore).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies", async () => {
    configured.mockReturnValue(true);

    const response = (await POST(
      request(validRun, { ip: "203.0.113.2", contentLength: 4_096 }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(413);
  });

  it("rejects malformed JSON", async () => {
    configured.mockReturnValue(true);

    const response = (await POST(
      request(undefined, { ip: "203.0.113.3", malformed: true }),
    )) as unknown as MockResponse;
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/valid JSON/i);
  });

  it("returns field errors for invalid runs", async () => {
    configured.mockReturnValue(true);

    const response = (await POST(
      request({ ...validRun, name: "!", score: -5 }, { ip: "203.0.113.4" }),
    )) as unknown as MockResponse;
    const body = (await response.json()) as {
      fieldErrors: Record<string, string[]>;
    };

    expect(response.status).toBe(422);
    expect(body.fieldErrors.name[0]).toBeDefined();
    expect(body.fieldErrors.score[0]).toBeDefined();
    expect(persistScore).not.toHaveBeenCalled();
  });

  it("saves a valid run with a normalized callsign", async () => {
    configured.mockReturnValue(true);
    persistScore.mockResolvedValue({
      entry: savedEntry,
      rank: 3,
      retained: true,
    });

    const response = (await POST(
      request(validRun, { ip: "203.0.113.5" }),
    )) as unknown as MockResponse;
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(persistScore).toHaveBeenCalledWith(
      expect.objectContaining({ name: "NOVA", score: 4820 }),
    );
    expect(body).toEqual({ entry: savedEntry, rank: 3, retained: true });
  });

  it("rejects a run that falls below the player's two retained scores", async () => {
    configured.mockReturnValue(true);
    persistScore.mockResolvedValue({
      entry: savedEntry,
      rank: 0,
      retained: false,
    });

    const response = (await POST(
      request(validRun, { ip: "203.0.113.8" }),
    )) as unknown as MockResponse;
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toMatch(/two highest scores/i);
  });

  it("reports a server error when persistence fails", async () => {
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    configured.mockReturnValue(true);
    persistScore.mockRejectedValue(new Error("write failed"));

    const response = (await POST(
      request(validRun, { ip: "203.0.113.6" }),
    )) as unknown as MockResponse;
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/Could not save/i);
    expect(consoleError).toHaveBeenCalled();
  });

  it("rate-limits after six submissions from the same client", async () => {
    configured.mockReturnValue(false);
    const ip = "203.0.113.7";

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const response = (await POST(request(validRun, { ip }))) as unknown as MockResponse;
      expect(response.status).toBe(503);
    }

    const limited = (await POST(
      request(validRun, { ip }),
    )) as unknown as MockResponse;
    const body = await limited.json();

    expect(limited.status).toBe(429);
    expect(limited.headers["Retry-After"]).toBe("60");
    expect(body.error).toMatch(/Too many runs/i);
  });
});
