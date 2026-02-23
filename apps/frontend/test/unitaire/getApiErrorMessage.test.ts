import { describe, expect, it } from "vitest";
import { ApiRequestError } from "../../src/functions/apiRequest";
import { getApiErrorMessage } from "../../src/functions/getApiErrorMessage";

describe("getApiErrorMessage", () => {
  it("returns backend message when present", () => {
    const error = new ApiRequestError("Identifiants invalides", 401);
    expect(getApiErrorMessage(error)).toBe("Identifiants invalides");
  });

  it("returns fallback for 401 when backend message is missing", () => {
    const error = new ApiRequestError(undefined, 401);
    expect(getApiErrorMessage(error)).toBe(
      "Session expiree, merci de vous reconnecter.",
    );
  });

  it("returns fallback for 500 when backend message is missing", () => {
    const error = new ApiRequestError(undefined, 500);
    expect(getApiErrorMessage(error)).toBe("Erreur serveur, reessayez plus tard.");
  });
});
