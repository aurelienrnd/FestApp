import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import multer from "multer";
import { updateArtist } from "../../src/controllers/admin/artists/update_artist.controller";
import { query } from "../../src/db";
import { unlink } from "fs/promises";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock de la base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Mock de sharp pour eviter la conversion reelle d'image
vi.mock("sharp", () => {
  const toFile = vi.fn().mockResolvedValue(undefined);
  const webp = vi.fn().mockReturnValue({ toFile });
  return { default: vi.fn().mockReturnValue({ webp }) };
});

// Mock de fs/promises pour eviter les operations reelles sur le disque
vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

// Mock de randomUUID pour un nom de fichier deterministe
vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("new-uuid"),
}));

const mockQuery = vi.mocked(query);

// Cree une instance Express configuree avec multer et la route de modification d'artiste
function createApp() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });
  app.patch("/artists/:id", upload.single("image"), asyncHandler(updateArtist));
  app.use(errorHandler);
  return app;
}

const ARTIST_ID = "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0";

const validFields = {
  name: "Band A",
  genre: "Metal",
  origin: "France",
  bio: "Une bio",
  description_media: "Photo de Band A",
  stage: "Grande Scene",
  start_time: "2025-06-20T18:00:00.000Z",
  end_time: "2025-06-20T19:30:00.000Z",
};

const mockExistingArtist = {
  id: ARTIST_ID,
  url_media: `/uploads/artists/${ARTIST_ID}.webp`,
};

const mockUpdatedArtist = {
  id: ARTIST_ID,
  name: "Band A",
  genre: "Metal",
  origin: "France",
  bio: "Une bio",
  url_media: `/uploads/artists/${ARTIST_ID}.webp`,
  description_media: "Photo de Band A",
  youtube_url: null,
  spotify_url: null,
};

const mockUpdatedConcert = {
  id: "concert-uuid",
  artist_id: ARTIST_ID,
  stage: "Grande Scene",
  start_time: "2025-06-20T18:00:00.000Z",
  end_time: "2025-06-20T19:30:00.000Z",
};

describe("updateArtist controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with updated artist on success (sans nouvelle image)", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArtist]) // SELECT artiste existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedArtist]) // UPDATE artists
      .mockResolvedValueOnce([mockUpdatedConcert]) // UPDATE concerts
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
      .field(validFields);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Artiste modifie");
    expect(res.body.artist).toMatchObject({ id: ARTIST_ID, name: "Band A" });
    expect(mockQuery).toHaveBeenCalledWith("COMMIT");
  });

  it("should return 200 and use new image url when image is provided", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArtist]) // SELECT artiste existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([
        { ...mockUpdatedArtist, url_media: "/uploads/artists/new-uuid.webp" },
      ]) // UPDATE artists
      .mockResolvedValueOnce([mockUpdatedConcert]) // UPDATE concerts
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
      .field(validFields)
      .attach("image", Buffer.from("fake-image"), {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.artist.url_media).toBe("/uploads/artists/new-uuid.webp");
  });

  it("should return 400 when artist id is invalid", async () => {
    const app = createApp();
    const res = await request(app)
      .patch("/artists/not-a-uuid")
      .field(validFields);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when artist does not exist", async () => {
    mockQuery.mockResolvedValueOnce([]); // SELECT retourne rien

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
      .field(validFields);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTIST_NOT_FOUND);
  });

  it("should rollback and return 500 when artist update fails", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArtist]) // SELECT artiste existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockRejectedValueOnce(new Error("db fail")) // UPDATE artists
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
      .field(validFields);

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });

  it("should rollback and return 500 when concert update fails", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArtist]) // SELECT artiste existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedArtist]) // UPDATE artists
      .mockRejectedValueOnce(new Error("db fail")) // UPDATE concerts
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
      .field(validFields);

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
    expect(vi.mocked(unlink)).not.toHaveBeenCalled();
  });

  it("should rollback and unlink new file when COMMIT fails after sharp wrote the file", async () => {
    mockQuery
      .mockResolvedValueOnce([mockExistingArtist]) // SELECT artiste existant
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockUpdatedArtist]) // UPDATE artists
      .mockResolvedValueOnce([mockUpdatedConcert]) // UPDATE concerts
      .mockRejectedValueOnce(new Error("commit fail")) // COMMIT
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .patch(`/artists/${ARTIST_ID}`)
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
