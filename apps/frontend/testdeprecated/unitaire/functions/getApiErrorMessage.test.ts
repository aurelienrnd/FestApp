import { describe, expect, it } from "vitest";
import { ApiRequestError } from "../../../src/functions/apiRequest";
import { getApiErrorMessage } from "../../../src/functions/getApiErrorMessage";

describe("getApiErrorMessage", () => {
  it("returns backend message when present", () => {
    // Simule une erreur 401 avec un message explicite fourni par le backend
    const error = new ApiRequestError("Identifiants invalides", 401);

    expect(getApiErrorMessage(error)).toBe("Identifiants invalides");
  });

  it("returns fallback for 401 when backend message is missing", () => {
    // Simule une erreur 401 sans message explicite
    const error = new ApiRequestError(undefined, 401);

    expect(getApiErrorMessage(error)).toBe(
      "Session expiree, merci de vous reconnecter.",
    );
  });

  it("returns fallback for 403 when backend message is missing", () => {
    // Simule une erreur 403 sans message explicite
    const error = new ApiRequestError(undefined, 403);

    expect(getApiErrorMessage(error)).toBe("Acces refuse.");
  });

  it("returns fallback for 404 when backend message is missing", () => {
    // Simule une erreur 404 sans message explicite
    const error = new ApiRequestError(undefined, 404);

    expect(getApiErrorMessage(error)).toBe("Ressource introuvable.");
  });

  it("returns fallback for 429 when backend message is missing", () => {
    // Simule une erreur 429 sans message explicite (trop de tentatives)
    const error = new ApiRequestError(undefined, 429);

    expect(getApiErrorMessage(error)).toBe(
      "Trop de tentatives, reessayez plus tard.",
    );
  });

  it("returns fallback for 500 when backend message is missing", () => {
    // Simule une erreur 500 sans message explicite
    const error = new ApiRequestError(undefined, 500);

    expect(getApiErrorMessage(error)).toBe(
      "Erreur serveur, reessayez plus tard.",
    );
  });

  it("returns generic fallback for unknown status", () => {
    // Simule une erreur avec un code HTTP non pris en charge specifiquement
    const error = new ApiRequestError(undefined, 400);

    expect(getApiErrorMessage(error)).toBe("Une erreur est survenue.");
  });

  it("treats 'Erreur API' message as missing and uses status fallback", () => {
    // Simule une erreur 401 avec le message generique par defaut "Erreur API"
    const error = new ApiRequestError("Erreur API", 401);

    expect(getApiErrorMessage(error)).toBe(
      "Session expiree, merci de vous reconnecter.",
    );
  });
});
