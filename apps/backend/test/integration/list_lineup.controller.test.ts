import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

import { listLineup } from "../../src/controllers/public/lineup/list_lineup.controller";
import { query } from "../../src/db";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";

// Mock de la fonction query pour isoler les appels base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
const mockQuery = vi.mocked(query);

/** Creation d'une application Express pour les tests
 * @return l'application Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.get("/lineup", asyncHandler(listLineup));
  app.use(errorHandler);
  return app;
}

describe("listLineup controller (integration)", () => {
  // Reinitialise les mocks avant chaque test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 200 with artists list including concert data", async () => {
    // Simulation d'une reponse base de donnees retournant deux artistes avec concert associe
    mockQuery.mockResolvedValueOnce([
      {
        id: "artist-1",
        name: "Band A",
        genre: "Metal",
        origin: "France",
        bio: "Une bio",
        url_media: "https://youtube.com/bandA",
        description_media: "Live at Hellfest",
        stage: "Grande Scene",
        start_time: "2025-06-20T18:00:00.000Z",
        end_time: "2025-06-20T19:30:00.000Z",
      },
      {
        id: "artist-2",
        name: "Band B",
        genre: "Rock",
        origin: "USA",
        bio: "Autre bio",
        url_media: "https://youtube.com/bandB",
        description_media: "Studio session",
        stage: "Scene Metal",
        start_time: "2025-06-21T20:00:00.000Z",
        end_time: "2025-06-21T21:30:00.000Z",
      },
    ]);

    // Creation de l'application et envoi de la requete
    const app = createApp();
    const res = await request(app).get("/lineup");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(2);
    expect(res.body.artists[0]).toEqual({
      id: "artist-1",
      name: "Band A",
      genre: "Metal",
      origin: "France",
      bio: "Une bio",
      url_media: "https://youtube.com/bandA",
      description_media: "Live at Hellfest",
      stage: "Grande Scene",
      start_time: "2025-06-20T18:00:00.000Z",
      end_time: "2025-06-20T19:30:00.000Z",
    });
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("LEFT JOIN concerts"),
    );
  });

  it("should return 200 with null concert fields when artist has no concert", async () => {
    // Simulation d'un artiste sans concert associe (LEFT JOIN retourne null)
    mockQuery.mockResolvedValueOnce([
      {
        id: "artist-1",
        name: "Band A",
        genre: "Metal",
        origin: "France",
        bio: "Une bio",
        url_media: "https://youtube.com/bandA",
        description_media: "Live at Hellfest",
        stage: null,
        start_time: null,
        end_time: null,
      },
    ]);

    const app = createApp();
    const res = await request(app).get("/lineup");

    expect(res.status).toBe(200);
    expect(res.body.artists[0].stage).toBeNull();
    expect(res.body.artists[0].start_time).toBeNull();
    expect(res.body.artists[0].end_time).toBeNull();
  });

  it("should return 200 with empty array when no artists", async () => {
    // Simulation d'une reponse vide (aucun artiste en base)
    mockQuery.mockResolvedValueOnce([]);

    // Creation de l'application et envoi de la requete
    const app = createApp();
    const res = await request(app).get("/lineup");

    expect(res.status).toBe(200);
    expect(res.body.artists).toHaveLength(0);
  });

  it("should return 500 when database throws", async () => {
    // Simulation d'une erreur base de donnees
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // Creation de l'application et envoi de la requete
    const app = createApp();
    const res = await request(app).get("/lineup");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});
