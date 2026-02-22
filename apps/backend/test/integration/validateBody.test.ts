import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import { ERRORS } from "../../src/errors/errorMessages";
import { validateBody } from "../../src/middlewares/validateBody";
import { createUserSchema, loginSchema } from "../../src/schemas/schema";
import { errorHandler } from "../../src/middlewares/errorHandler";

function createApp(schema: typeof createUserSchema | typeof loginSchema) {
  const app = express();
  app.use(express.json());
  app.post("/test", validateBody(schema), (req, res) => {
    return res.status(200).json(req.body);
  });
  app.use(errorHandler);
  return app;
}

describe("validateBody", () => {
  it("should allow valid createUser body and trim display_name", async () => {
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "Test1234!",
      display_name: " TestAdmin ",
    });

    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe("TestAdmin");
  });

  it("should return 400 if createUser email is invalid", async () => {
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "pas-un-email",
      password: "Test1234!",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: ERRORS.VALIDATION_INVALID_BODY }),
    );
  });

  it("should return 400 if createUser password is too short", async () => {
    const app = createApp(createUserSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "123",
      display_name: "TestAdmin",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: ERRORS.VALIDATION_INVALID_BODY }),
    );
  });

  it("should allow valid login body", async () => {
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(200);
  });

  it("should return 400 if login email is invalid", async () => {
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "pas-un-email",
      password: "Test1234!",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: ERRORS.VALIDATION_INVALID_BODY }),
    );
  });

  it("should return 400 if login password is too short", async () => {
    const app = createApp(loginSchema);
    const res = await request(app).post("/test").send({
      email: "admin@test.fr",
      password: "123",
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({ error: ERRORS.VALIDATION_INVALID_BODY }),
    );
  });
});
