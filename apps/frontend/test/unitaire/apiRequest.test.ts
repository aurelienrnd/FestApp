import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiRequestError, apiRequest } from "../../src/functions/apiRequest";

describe("apiRequest", () => {
  // Initialise une URL API de test
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000";
  });

  // Reinitialise les mocks entre chaque test
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns data on success response", async () => {
    // Simule une reponse API en succes
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ token: "abc" }),
    } as unknown as Response);

    // Appelle la fonction a tester
    const result = await apiRequest("/admin/auth/login", {
      method: "POST",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:4000/admin/auth/login",
      {
        credentials: "include",
        method: "POST",
      },
    );
    expect(result).toEqual({
      data: { token: "abc" },
      error: null,
    });
  });

  it("returns structured error on HTTP error response", async () => {
    // Simule une reponse API en erreur HTTP
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 429,
      json: vi.fn().mockResolvedValue({ error: "Trop de tentatives" }),
    } as unknown as Response);

    const result = await apiRequest("/admin/auth/login");

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(ApiRequestError);

    if (!(result.error instanceof ApiRequestError)) {
      throw new Error(
        "Expected result.error to be an ApiRequestError instance",
      );
    }
    expect(result.error.message).toBe("Trop de tentatives");
    expect(result.error.status).toBe(429);
  });

  it("returns error when fetch rejects", async () => {
    // Simule une erreur reseau
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network down"));

    const result = await apiRequest("/admin/auth/login");

    expect(result.data).toBeNull();
    expect(result.error).toBeInstanceOf(ApiRequestError);

    if (!(result.error instanceof ApiRequestError)) {
      throw new Error(
        "Expected result.error to be an ApiRequestError instance",
      );
    }
    expect(result.error.message).toBe("Network down");
    expect(result.error.status).toBe(500);
  });
});
