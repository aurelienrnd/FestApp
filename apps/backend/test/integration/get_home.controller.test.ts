import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

import { getHomeController } from "../../src/controllers/public/home/get_home.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);

function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/home", asyncHandler(getHomeController));
  app.use(errorHandler);
  return app;
}

describe("getHomeController (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with artists and newsList when both queries return data", async () => {
    mockQuery
      .mockResolvedValueOnce([
        {
          id: "artist-1",
          name: "Band A",
          url_media: "https://example.com/img.jpg",
          description_media: "Live shot",
          stage: "Grande Scene",
          start_time: "2025-06-21T20:00:00.000Z",
          end_time: "2025-06-21T21:30:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "news-1",
          title: "News A",
          url_media: "https://example.com/news.jpg",
          description_media: "Photo news",
          created_at: "2025-06-01T10:00:00.000Z",
        },
      ]);

    const res = await request(createApp()).get("/home");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(1);
    expect(res.body.newsList).toHaveLength(1);
    expect(res.body.artists[0].name).toBe("Band A");
    expect(res.body.newsList[0].title).toBe("News A");
  });

  it("should return 200 with empty arrays when both tables are empty", async () => {
    mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const res = await request(createApp()).get("/home");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(0);
    expect(res.body.newsList).toHaveLength(0);
  });

  it("should return 200 with empty artists when no artist has a concert", async () => {
    mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        id: "news-1",
        title: "News A",
        url_media: "https://example.com/news.jpg",
        description_media: "Photo news",
        created_at: "2025-06-01T10:00:00.000Z",
      },
    ]);

    const res = await request(createApp()).get("/home");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(0);
    expect(res.body.newsList).toHaveLength(1);
  });

  it("should return 500 when the artists query throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const res = await request(createApp()).get("/home");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });

  it("should return 500 when the news query throws", async () => {
    mockQuery
      .mockResolvedValueOnce([])
      .mockRejectedValueOnce(new Error("db fail"));

    const res = await request(createApp()).get("/home");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });

  it("should query artists with LEFT JOIN concerts", async () => {
    mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    await request(createApp()).get("/home");

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("LEFT JOIN concerts"),
    );
  });
});
