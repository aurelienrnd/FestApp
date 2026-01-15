import { describe, it, expect, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  getEnv,
  envToStringValue,
  userExists,
  passwordIsValid,
  initToken,
  serializeCookie,
} from "../../src/functions";

let originalEnv: NodeJS.ProcessEnv;

// Sauvegarde et restauration des variables d'environnement
beforeEach(() => {
  originalEnv = { ...process.env };
});
afterEach(() => {
  process.env = originalEnv;
});

describe("getEnv", () => {
  it("returns env value when present", () => {
    process.env.TEST_ENV = "value";
    expect(getEnv("TEST_ENV")).toBe("value");
  });

  it("throws when env is missing", () => {
    delete process.env.TEST_ENV;
    expect(() => getEnv("TEST_ENV")).toThrow(/Missing env var/);
  });
});

describe("envToStringValue", () => {
  it("returns a valid duration string", () => {
    process.env.DURATION_TEST = "10s";
    expect(envToStringValue("DURATION_TEST")).toBe("10s");
  });

  it("throws on invalid duration string", () => {
    process.env.DURATION_TEST = "invalid";
    expect(() => envToStringValue("DURATION_TEST")).toThrow(/Invalid duration/);
  });
});

describe("userExists", () => {
  it("does not throw when user exists", () => {
    expect(() =>
      userExists({
        id: "u1",
        email: "a@test.local",
        password_hash: "hash",
        display_name: "A",
        is_active: true,
      }),
    ).not.toThrow();
  });

  it("throws when user is undefined", () => {
    expect(() => userExists(undefined)).toThrow(/email ou mot de passe/);
  });
});

describe("passwordIsValid", () => {
  it("does not throw for valid password", () => {
    const hash = bcrypt.hashSync("Password123!", 10);
    expect(() => passwordIsValid("Password123!", hash)).not.toThrow();
  });

  it("throws for invalid password", () => {
    const hash = bcrypt.hashSync("Password123!", 10);
    expect(() => passwordIsValid("wrong", hash)).toThrow(
      /email ou mot de passe/,
    );
  });
});

describe("initToken", () => {
  it("returns a signed token with expected payload", () => {
    process.env.JWT_ACCESS_SECRET = "test-secret";
    process.env.JWT_ACCESS_EXPIRES_IN = "1h";

    const token = initToken(
      "user-1",
      "JWT_ACCESS_SECRET",
      "JWT_ACCESS_EXPIRES_IN",
      "sess-1",
    );

    const payload = jwt.verify(token, "test-secret") as jwt.JwtPayload;
    expect(payload.userId).toBe("user-1");
    expect(payload.sessionId).toBe("sess-1");
  });
});

describe("serializeCookie", () => {
  it("serializes a cookie with expected options", () => {
    process.env.COOKIE_ACCESS_TOKEN_NAME = "access_token";
    process.env.COOKIE_ACCESS_TOKEN_SECURE = "true";
    process.env.COOKIE_ACCESS_TOKEN_SAME_SITE = "lax";
    process.env.JWT_ACCESS_EXPIRES_IN = "1h";

    const cookie = serializeCookie(
      "COOKIE_ACCESS_TOKEN_NAME",
      "COOKIE_ACCESS_TOKEN_SECURE",
      "COOKIE_ACCESS_TOKEN_SAME_SITE",
      "token-123",
      "JWT_ACCESS_EXPIRES_IN",
    );

    expect(cookie).toContain("access_token=token-123");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });
});
