import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { requireRole } from "../../src/middlewares/requireRole";
import { errorHandler } from "../../src/middlewares/errorHandler";
import { ERRORS } from "../../src/errors/errorMessages";

/** Creation d'une application Express pour les tests
 * @param {string} userRole role injecte dans res.locals (simule le middleware auth)
 * @param {...string} allowedRoles roles autorises sur la route
 * @return l'application Express
 */
function createApp(userRole: string | undefined, ...allowedRoles: string[]) {
  const app = express();
  app.use((_req, res, next) => {
    res.locals.userRole = userRole;
    next();
  });
  app.get("/protected", requireRole(...allowedRoles), (_req, res) => {
    res.status(200).json({ ok: true });
  });
  app.use(errorHandler);
  return app;
}

describe("requireRole middleware", () => {
  it("should call next when role is allowed", async () => {
    const app = createApp("admin", "admin");
    const res = await request(app).get("/protected");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("should allow access when role is one of multiple allowed roles", async () => {
    const app = createApp("lineup", "admin", "lineup");
    const res = await request(app).get("/protected");

    expect(res.status).toBe(200);
  });

  it("should return 403 when role is not allowed", async () => {
    const app = createApp("lineup", "admin");
    const res = await request(app).get("/protected");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("should return 403 when userRole is undefined", async () => {
    const app = createApp(undefined, "admin");
    const res = await request(app).get("/protected");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });

  it("should return 403 when no roles are allowed", async () => {
    const app = createApp("admin");
    const res = await request(app).get("/protected");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe(ERRORS.FORBIDDEN);
  });
});
