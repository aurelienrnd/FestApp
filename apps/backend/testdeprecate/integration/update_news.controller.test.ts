import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import multer from "multer";
import { updateNews } from "../../src/controllers/admin/news/update_news.controller";
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
  app.patch("/news/:id", upload.single("image"), asyncHandler(updateNews));
  app.use(errorHandler);
  return app;
}

const NEWS_ID = "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0";

const validFields = {
  title: "Ouverture de la billetterie",
  content: "Contenu mis a jour.",
  is_published: "true",
  description_media: "Photo de la billetterie",
};

const mockExistingNews = {
  id: NEWS_ID,
  url_media: `/uploads/news/${NEWS_ID}.webp`,
};

const mockUpdatedNews = {
  id: NEWS_ID,
  title: "Ouverture de la billetterie",
  content: "Contenu mis a jour.",
  is_published: true,
  created_at: "2025-06-01T10:00:00.000Z",
  url_media: `/uploads/news/${NEWS_ID}.webp`,
  description_media: "Photo de la billetterie",
  user_id: "user-uuid",
};

const mockNewsWithAuthor = { ...mockUpdatedNews, author_name: "Admin" };

describe("updateNews controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with updated news on success (sans nouvelle image)", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingNews]) // SELECT news existante
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedNews]) // UPDATE news
      .mockResolvedValueOnce([mockNewsWithAuthor]) // SELECT avec JOIN author
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app).patch(`/news/${NEWS_ID}`).field(validFields);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("News modifiee");
    expect(res.body.news).toMatchObject({
      id: NEWS_ID,
      author_name: "Admin",
    });
    expect(mockQuery).toHaveBeenCalledWith("COMMIT");
  });

  it("should return 200 and use new image url when image is provided", async () => {
    const newUrl = "/uploads/news/new-uuid.webp";
    mockQuery
      .mockResolvedValueOnce([mockExistingNews]) // SELECT news existante
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([{ ...mockUpdatedNews, url_media: newUrl }]) // UPDATE news
      .mockResolvedValueOnce([{ ...mockNewsWithAuthor, url_media: newUrl }]) // SELECT avec JOIN
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .patch(`/news/${NEWS_ID}`)
      .field(validFields)
      .attach("image", Buffer.from("fake-image"), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.news.url_media).toBe(newUrl);
  });

  it("should return 400 when news id is invalid", async () => {
    const app = createApp();
    const res = await request(app).patch("/news/not-a-uuid").field(validFields);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when news does not exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await request(app).patch(`/news/${NEWS_ID}`).field(validFields);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.NEWS_NOT_FOUND);
  });

  it("should rollback and return 500 when update fails", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingNews]) // SELECT news existante
      .mockResolvedValueOnce([]) // BEGIN
      .mockRejectedValueOnce(new Error("db fail")) // UPDATE news
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app).patch(`/news/${NEWS_ID}`).field(validFields);

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });

  it("should rollback and unlink new file when COMMIT fails after sharp wrote the file", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingNews]) // SELECT news existante
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedNews]) // UPDATE news
      .mockResolvedValueOnce([mockNewsWithAuthor]) // SELECT avec JOIN
      .mockRejectedValueOnce(new Error("commit fail")) // COMMIT
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/news/${NEWS_ID}`)
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
