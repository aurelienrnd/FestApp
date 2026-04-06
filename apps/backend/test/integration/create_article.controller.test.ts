import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import multer from "multer";

import { createArticle } from "../../src/controllers/admin/articles/create_article.controller";
import { query } from "../../src/db";
import { unlink } from "fs/promises";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

vi.mock("sharp", () => {
  const toFile = vi.fn().mockResolvedValue(undefined);
  const webp = vi.fn().mockReturnValue({ toFile });
  return { default: vi.fn().mockReturnValue({ webp }) };
});

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

const mockQuery = vi.mocked(query);

function createApp() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/articles", upload.single("image"), asyncHandler(createArticle));
  app.use(errorHandler);
  return app;
}

const validFields = {
  title: "Ouverture de la billetterie",
  content: "Le festival ouvre sa billetterie.",
  is_published: "true",
  description_media: "Photo de la billetterie",
};

const mockArticle = {
  id: "article-uuid",
  title: "Ouverture de la billetterie",
  content: "Le festival ouvre sa billetterie.",
  is_published: true,
  created_at: "2025-06-01T10:00:00.000Z",
  url_media: "/uploads/articles/test-uuid.webp",
  description_media: "Photo de la billetterie",
  user_id: "user-uuid",
  author_name: "Admin",
};

const fakeImage = Buffer.from("fake-image-data");

describe("createArticle controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 with article data on success", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockArticle]) // CTE INSERT + SELECT JOIN
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .post("/articles")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Article cree");
    expect(res.body.article).toMatchObject({
      id: "article-uuid",
      title: "Ouverture de la billetterie",
      author_name: "Admin",
    });
    expect(mockQuery).toHaveBeenCalledWith("COMMIT");
  });

  it("should return 400 when no image file is provided", async () => {
    const app = createApp();
    const res = await request(app).post("/articles").field(validFields);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.ARTICLE_FILE_REQUIRED);
  });

  it("should rollback and return 500 when insert fails", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockRejectedValueOnce(new Error("db fail")) // CTE INSERT
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .post("/articles")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });

  it("should rollback and unlink file when COMMIT fails after sharp wrote the file", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockArticle]) // CTE INSERT
      .mockRejectedValueOnce(new Error("commit fail")) // COMMIT
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .post("/articles")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
    expect(vi.mocked(unlink)).toHaveBeenCalledWith(
      expect.stringContaining("test-uuid.webp"),
    );
  });
});
