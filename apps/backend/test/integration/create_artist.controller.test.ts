import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import multer from "multer";

import { createArtist } from "../../src/controllers/admin/artists/create_artist.controller";
import { query } from "../../src/db";
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

// Mock de fs/promises pour eviter la creation reelle du dossier
vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

// Mock de randomUUID pour un nom de fichier deterministe
vi.mock("crypto", () => ({
  randomUUID: vi.fn().mockReturnValue("test-uuid"),
}));

const mockQuery = vi.mocked(query);

/** Creation d'une application Express avec multer pour les tests multipart */
function createApp() {
  const app = express();
  const upload = multer({ storage: multer.memoryStorage() });
  app.post("/artists", upload.single("image"), asyncHandler(createArtist));
  app.use(errorHandler);
  return app;
}

// Donnees valides pour la creation d'un artiste, a personnaliser selon les besoins du schema de validation.
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

// Donnees de test pour les reponses de la base de donnees
const mockArtist = {
  id: "artist-uuid",
  name: "Band A",
  genre: "Metal",
  origin: "France",
  bio: "Une bio",
  url_media: "/uploads/artists/test-uuid.webp",
  description_media: "Photo de Band A",
};

// Donnees de test pour les reponses de la base de donnees
const mockConcert = {
  id: "concert-uuid",
  artist_id: "artist-uuid",
  stage: "Grande Scene",
  start_time: "2025-06-20T18:00:00.000Z",
  end_time: "2025-06-20T19:30:00.000Z",
};

// Buffer d'image factice pour les tests d'upload
const fakeImage = Buffer.from("fake-image-data");

describe("createArtist controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 201 with artist data on success", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockArtist]) // INSERT artists
      .mockResolvedValueOnce([mockConcert]) // INSERT concerts
      .mockResolvedValueOnce([]); // COMMIT

    const app = createApp();
    const res = await request(app)
      .post("/artists")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Artiste cree");
    expect(res.body.artist).toMatchObject({
      id: "artist-uuid",
      name: "Band A",
    });
    expect(mockQuery).toHaveBeenCalledWith("COMMIT");
  });

  it("should return 400 when no image file is provided", async () => {
    const app = createApp();
    const res = await request(app).post("/artists");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.ARTIST_FILE_REQUIRED);
  });

  it("should rollback and return 500 when artist insert fails", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockRejectedValueOnce(new Error("db fail")) // INSERT artists
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .post("/artists")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });

  it("should rollback and return 500 when concert insert fails", async () => {
    mockQuery
      .mockResolvedValueOnce([]) // BEGIN
      .mockResolvedValueOnce([mockArtist]) // INSERT artists
      .mockRejectedValueOnce(new Error("db fail")) // INSERT concerts
      .mockResolvedValueOnce([]); // ROLLBACK

    const app = createApp();
    const res = await request(app)
      .post("/artists")
      .field(validFields)
      .attach("image", fakeImage, {
        filename: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(500);
    expect(mockQuery).toHaveBeenCalledWith("ROLLBACK");
  });
});
