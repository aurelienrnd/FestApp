import { getApiErrorMessage } from "@/functions/getApiErrorMessage";
import { ApiRequestError } from "@/functions/apiRequest";

// ---------------------------------------------------------------------------

describe("getApiErrorMessage", () => {
  it("retourne le message de l'API si celui-ci est explicite et non vide", () => {
    // un message explicite present dans l'erreur doit etre retourne directement
    const error = new ApiRequestError("Email deja utilise.", 409);

    expect(getApiErrorMessage(error)).toBe("Email deja utilise.");
  });

  it("retourne le message generique 401 si le message est absent", () => {
    // sans message explicite, on se base sur le code HTTP
    const error = new ApiRequestError(undefined, 401);

    expect(getApiErrorMessage(error)).toBe(
      "Session expiree, merci de vous reconnecter.",
    );
  });

  it("retourne le message generique 403 si le message est absent", () => {
    const error = new ApiRequestError(undefined, 403);

    expect(getApiErrorMessage(error)).toBe("Acces refuse.");
  });

  it("retourne le message generique 404 si le message est absent", () => {
    const error = new ApiRequestError(undefined, 404);

    expect(getApiErrorMessage(error)).toBe("Ressource introuvable.");
  });

  it("retourne le message serveur pour tout status >= 500", () => {
    // les erreurs 5xx sont regroupees sous un message generique serveur
    const error = new ApiRequestError(undefined, 503);

    expect(getApiErrorMessage(error)).toBe("Erreur serveur, reessayez plus tard.");
  });

  it("retourne le message de fallback pour un status inconnu", () => {
    // les codes non geres retournent un message generique
    const error = new ApiRequestError(undefined, 422);

    expect(getApiErrorMessage(error)).toBe("Une erreur est survenue.");
  });
});
