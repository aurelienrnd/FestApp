import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { login } from "../../src/controllers/admin/auth/login.controller";
import { query } from "../../src/db";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";
import { asyncHandler } from "../../src/middlewares/asyncHandler";
import { errorHandler } from "../../src/middlewares/errorHandler";
import {
  envToStringValue,
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../../src/functions";

// mock de la fonction query, envToStringValue, userExists, passwordIsValid, initToken et serializeCookie
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));
vi.mock("../../src/functions", () => ({
  envToStringValue: vi.fn(),
  userExists: vi.fn(),
  passwordIsValid: vi.fn(),
  initToken: vi.fn(),
  serializeCookie: vi.fn(),
}));
const mockQuery = vi.mocked(query);
const mockEnvToStringValue = vi.mocked(envToStringValue);
const mockUserExists = vi.mocked(userExists);
const mockPasswordIsValid = vi.mocked(passwordIsValid);
const mockInitToken = vi.mocked(initToken);
const mockSerializeCookie = vi.mocked(serializeCookie);

/** Creation d'une application Express pour les tests
 * @return l'aplication Express
 */
function createApp() {
  const app = express();
  app.use(express.json());
  app.post("/login", asyncHandler(login));
  app.use(errorHandler);
  return app;
}

describe("login controller (integration)", () => {
  // Réinitialiser les mocks avant chaque test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 200 and set cookie when login is successful", async () => {
    // Simulation des variables d'environnement
    process.env.SESSION_EXPIRES_IN = "1h";
    mockEnvToStringValue.mockReturnValue("1h");

    // Simulation des réponses de la base de données
    mockQuery
      .mockResolvedValueOnce([
        {
          id: "user-1",
          email: "admin@test.fr",
          password_hash: "hash",
          display_name: "TestAdmin",

        },
      ]) // SELECT user by email
      .mockResolvedValueOnce([{ id: "sess-1" }]) // INSERT session
      .mockResolvedValueOnce([
        {
          id: "sess-1",
          user_id: "user-1",
          expires_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      ]); // SELECT session

    // simulation de l'initialisation du token et de la sérialisation du cookie
    mockInitToken.mockReturnValue("token-123");
    mockSerializeCookie.mockReturnValue("access_token=token-123; Path=/;");

    // creation de l'application express
    const app = createApp();

    // envoi de la requête de login
    const res = await request(app).post("/login").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(mockUserExists).toHaveBeenCalled();
    expect(mockPasswordIsValid).toHaveBeenCalled();
    expect(mockInitToken).toHaveBeenCalledWith(
      "user-1",
      "JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES_IN",
      "sess-1",
    );
    expect(mockSerializeCookie).toHaveBeenCalled();
  });

  it("should return 401 when user does not exist", async () => {
    // simulation de la réponse de la base de données/
    mockQuery.mockResolvedValueOnce([]); // no user found
    mockUserExists.mockImplementation(() => {
      throw new AppError(ERRORS.AUTH_INVALID_CREDENTIALS, 401);
    });

    // creation de l'application express
    const app = createApp();

    // envoi de la requête de login
    const res = await request(app).post("/login").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(401);
    expect(String(res.body.error)).toBe(ERRORS.AUTH_INVALID_CREDENTIALS);
  });

  it("should return 401 when password is invalid", async () => {
    // simulate database response
    mockQuery.mockResolvedValueOnce([
      {
        id: "user-1",
        email: "admin@test.fr",
        password_hash: "hash",
        display_name: "TestAdmin",

      },
    ]);

    // simulate userExists to return true
    mockPasswordIsValid.mockImplementation(() => {
      throw new AppError(ERRORS.AUTH_INVALID_CREDENTIALS, 401);
    });

    // create express app
    const app = createApp();

    // send login request
    const res = await request(app).post("/login").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(401);
    expect(String(res.body.error)).toBe(ERRORS.AUTH_INVALID_CREDENTIALS);
  });

  it("should return 401 when database throws", async () => {
    // simulation database response
    mockQuery.mockRejectedValueOnce(new Error("db fail"));

    // initialisation express app
    const app = createApp();

    // envoi de la requête de login
    const res = await request(app).post("/login").send({
      email: "admin@test.fr",
      password: "Test1234!",
    });

    expect(res.status).toBe(500);
    expect(String(res.body.error)).toBe(ERRORS.INTERNAL_SERVER_ERROR);
  });
});

