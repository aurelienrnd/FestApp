import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { AppError } from "../../src/errors/AppError";
import {
  errorHandler,
  notFoundHandler,
} from "../../src/middlewares/errorHandler";
import { asyncHandler } from "../../src/middlewares/asyncHandler";

/** Creation d'une application Express pour les tests.
 * @returns app
 */
function createApp() {
  const app = express();
  app.use(express.json());

  app.get(
    "/app-error",
    asyncHandler(async () => {
      throw new AppError("Access denied", 403);
    }),
  );

  app.get(
    "/unknown-error",
    asyncHandler(async () => {
      throw new Error("unexpected failure");
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

describe("error handlers (integration)", () => {
  it("should return 403 and AppError message for AppError", async () => {
    const app = createApp();
    const res = await request(app).get("/app-error");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Access denied");
  });

  it("should return 500 and generic message for unknown errors", async () => {
    const app = createApp();
    const res = await request(app).get("/unknown-error");

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");
  });

  it("should return 404 for unknown routes", async () => {
    const app = createApp();
    const res = await request(app).get("/missing-route");

    expect(res.status).toBe(404);
    expect(res.body.error).toContain("Route not found: GET /missing-route");
  });
});
