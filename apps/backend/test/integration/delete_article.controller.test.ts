import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import { deleteArticle } from "../../src/controllers/admin/articles/delete_article.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockQuery = vi.mocked(query);

function createApp() {
  const app = express();
  app.use(express.json());
  app.delete("/articles/:id", asyncHandler(deleteArticle));
  app.use(errorHandler);
  return app;
}

const ARTICLE_ID = "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0";

describe("deleteArticle controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when article is deleted", async () => {
    mockQuery.mockResolvedValueOnce([
      { id: ARTICLE_ID, url_media: `/uploads/articles/${ARTICLE_ID}.webp` },
    ]);

    const app = createApp();
    const res = await request(app).delete(`/articles/${ARTICLE_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Article supprime");
    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM articles WHERE id = $1 RETURNING id, url_media",
      [ARTICLE_ID],
    );
  });

  it("should return 400 when article id is invalid", async () => {
    const app = createApp();
    const res = await request(app).delete("/articles/not-a-uuid");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when article does not exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await request(app).delete(`/articles/${ARTICLE_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTICLE_NOT_FOUND);
  });

  it("should return 500 when database throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    const res = await request(app).delete(`/articles/${ARTICLE_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
