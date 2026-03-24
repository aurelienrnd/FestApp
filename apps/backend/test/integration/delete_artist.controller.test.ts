import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import express from "express";
import { deleteArtist } from "../../src/controllers/admin/artists/delete_artist.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock de la base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

// Mock de fs/promises pour eviter la suppression reelle du fichier image
vi.mock("fs/promises", () => ({
  unlink: vi.fn().mockResolvedValue(undefined),
}));

const mockQuery = vi.mocked(query);

// Cree une instance Express configuree avec la route de suppression d'artiste et le middleware global de gestion des erreurs
function createApp() {
  const app = express();
  app.use(express.json());
  app.delete("/artists/:id", asyncHandler(deleteArtist));
  app.use(errorHandler);
  return app;
}

describe("deleteArtist controller (integration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 when artist is deleted", async () => {
    mockQuery.mockResolvedValueOnce([
      {
        id: "7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
        url_media: "/uploads/artists/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0.webp",
      },
    ]);

    const app = createApp();
    const res = await request(app).delete(
      "/artists/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Artiste supprime");
    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM artists WHERE id = $1 RETURNING id, url_media",
      ["7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0"],
    );
  });

  it("should return 400 when artist id is invalid", async () => {
    const app = createApp();
    const res = await request(app).delete("/artists/not-a-uuid");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe(ERRORS.VALIDATION_INVALID_BODY);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("should return 404 when artist does not exist", async () => {
    mockQuery.mockResolvedValueOnce([]);

    const app = createApp();
    const res = await request(app).delete(
      "/artists/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(404);
    expect(res.body.error).toBe(ERRORS.ARTIST_NOT_FOUND);
  });

  it("should return 500 when database throws", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    const app = createApp();
    const res = await request(app).delete(
      "/artists/7bcf77a4-f4c0-4fbe-ab4b-f470dce2eef0",
    );

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
