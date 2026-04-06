import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import multer from "multer";
import { updateArticle } from "../../src/controllers/admin/articles/update_article.controller";
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
  randomUUID: vi.fn().mockReturnValue("new-uuid"),
}));

const mockQuery = vi.mocked(query);

function createApp() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });
  app.patch(
    "/articles/:id",
    upload.single("image"),
    asyncHandler(updateArticle),
  );
  app.use(errorHandler);
  return app;
}

const ARTICLE_ID = "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0";

const validFields = {
  title: "Ouverture de la billetterie",
  content: "Contenu mis a jour.",
  is_published: "true",
  description_media: "Photo de la billetterie",
};

const mockExistingArticle = {
  id: ARTICLE_ID,
  url_media: `/uploads/articles/${ARTICLE_ID}.webp`,
};

const mockUpdatedArticle = {
  id: ARTICLE_ID,
  title: "Ouverture de la billetterie",
  content: "Contenu mis a jour.",
  is_published: true,
  created_at: "2025-06-01T10:00:00.000Z",
  url_media: `/uploads/articles/${ARTICLE_ID}.webp`,
  description_media: "Photo de la billetterie",
  user_id: "user-uuid",
};

const mockArticleWithAuthor = { ...mockUpdatedArticle, author_name: "Admin" };

describe("updateArticle controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with updated article on success (sans nouvelle image)", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArticle]) // SELECT article existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedArticle]) // UPDATE articles
      .mockResolvedValueOnce([mockArticleWithAuthor]) // SELECT avec JOIN author
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .patch(`/articles/${ARTICLE_ID}`)
      .field(validFields);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Article modifie");
    expect(res.body.article).toMatchObject({
      id: ARTICLE_ID,
      author_name: "Admin",
    });
    expect(mockQuery).toHaveBeenCalledWith("COMMIT");
  });

  it("should return 200 and use new image url when image is provided", async () => {
    const newUrl = "/uploads/articles/new-uuid.webp";
    mockQuery
      .mockResolvedValueOnce([mockExistingArticle]) // SELECT article existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([{ ...mockUpdatedArticle, url_media: newUrl }]) // UPDATE articles
      .mockResolvedValueOnce([{ ...mockArticleWithAuthor, url_media: newUrl }]) // SELECT avec JOIN
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .patch(`/articles/${ARTICLE_ID}`)
      .field(validFields)
      .attach("image", Buffer.from("fake-image"), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.article.url_media).toBe(newUrl);
  });

  it("should return 400 when article id is invalid", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/articles/not-a-uuid")
      .field(validFields);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when article does not exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await request(app)
      .patch(`/articles/${ARTICLE_ID}`)
      .field(validFields);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTICLE_NOT_FOUND);
  });

  it("should rollback and return 500 when update fails", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArticle]) // SELECT article existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockRejectedValueOnce(new Error("db fail")) // UPDATE articles
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/articles/${ARTICLE_ID}`)
      .field(validFields);

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });

  it("should rollback and unlink new file when COMMIT fails after sharp wrote the file", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArticle]) // SELECT article existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedArticle]) // UPDATE articles
      .mockResolvedValueOnce([mockArticleWithAuthor]) // SELECT avec JOIN
      .mockRejectedValueOnce(new Error("commit fail")) // COMMIT
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/articles/${ARTICLE_ID}`)
      .field(validFields)
      .attach("image", Buffer.from("fake-image"), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
    expect(vi.mocked(unlink)).toHaveBeenCalledWith(
      expect.stringContaining("new-uuid.webp"),
    );
  });
});
