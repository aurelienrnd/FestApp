import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

import { getNewsList } from "../../src/controllers/public/news/get_news_list.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);

/** Cree une app Express avec un middleware optionnel pour simuler res.locals.userRole */
function createApp(userRole?: string) {
  const app = express();
  app.use(express.json());
  app.use((_req, res, next) => {
    if (userRole) res.locals.userRole = userRole;
    next();
  });
  app.get("/news", asyncHandler(getNewsList));
  app.use(errorHandler);
  return app;
}

const mockPublishedNews = {
  id: "news-1",
  title: "Ouverture de la billetterie",
  content: "Le festival ouvre sa billetterie.",
  is_published: true,
  created_at: "2025-06-01T10:00:00.000Z",
  url_media: "/uploads/news/news-1.webp",
  description_media: "Photo de la billetterie",
  user_id: "user-uuid",
  author_name: "Admin",
};

const mockDraftNews = {
  id: "news-2",
  title: "Nouvelle tete d affiche",
  content: "Bientot disponible.",
  is_published: false,
  created_at: "2025-06-02T10:00:00.000Z",
  url_media: "/uploads/news/news-2.webp",
  description_media: "Photo du nouvel artiste",
  user_id: "user-uuid",
  author_name: "Admin",
};

describe("getNewsList controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with only published news for unauthenticated user", async () => {
    mockQuery.mockResolvedValueOnce([mockPublishedNews]);

    const app = createApp();
    const res = await request(app).get("/news");

    expect(res.status).toBe(200);
    expect(res.body.newsList).toHaveLength(1);
    expect(res.body.newsList[0].is_published).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("WHERE a.is_published = TRUE"),
    );
  });

  it("should return all news (including drafts) for admin user", async () => {
    mockQuery.mockResolvedValueOnce([mockPublishedNews, mockDraftNews]);

    const app = createApp("admin");
    const res = await request(app).get("/news");

    expect(res.status).toBe(200);
    expect(res.body.newsList).toHaveLength(2);
    expect(mockQuery).not.toHaveBeenCalledWith(
      expect.stringContaining("WHERE a.is_published = TRUE"),
    );
  });

  it("should return all news (including drafts) for news user", async () => {
    mockQuery.mockResolvedValueOnce([mockPublishedNews, mockDraftNews]);

    const app = createApp("news");
    const res = await request(app).get("/news");

    expect(res.status).toBe(200);
    expect(res.body.newsList).toHaveLength(2);
  });

  it("should return 200 with empty array when no news", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await request(app).get("/news");

    expect(res.status).toBe(200);
    expect(res.body.newsList).toHaveLength(0);
  });

  it("should return 500 when database throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    const res = await request(app).get("/news");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
