import {
  checkEmailAvailable,
  checkDisplayNameAvailable,
  checkUserExists,
} from "../../src/services/user.service";
import { AppError } from "../../src/errors/AppError";
import { ERRORS } from "../../src/errors/errorMessages";

// mock de la couche db pour ne pas toucher la base de donnees
vi.mock("../../src/db", () => ({
  query: vi.fn(),
}));

import { query } from "../../src/db";

// recupere le mock de query sous forme typee pour le controler dans chaque test
const queryMock = vi.mocked(query);

// ---------------------------------------------------------------------------

describe("checkEmailAvailable", () => {
  it("ne throw pas si l'email n'existe pas en base", async () => {
    // simule une reponse vide : aucun utilisateur avec cet email
    queryMock.mockResolvedValueOnce([]);

    await expect(checkEmailAvailable("libre@test.com")).resolves.not.toThrow();
  });

  it("throw USER_EMAIL_ALREADY_USED si l'email est deja utilise", async () => {
    // simule une reponse avec un utilisateur existant
    queryMock.mockResolvedValueOnce([{ id: "uuid-existant" }]);

    await expect(checkEmailAvailable("pris@test.com")).rejects.toThrow(
      new AppError(ERRORS.USER_EMAIL_ALREADY_USED, 409),
    );
  });

  it("exclut l'utilisateur courant si excludeId est fourni (cas modification)", async () => {
    // simule une reponse vide : l'email n'est utilise que par l'utilisateur lui-meme
    queryMock.mockResolvedValueOnce([]);

    await expect(
      checkEmailAvailable("moi@test.com", "mon-uuid"),
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------

describe("checkDisplayNameAvailable", () => {
  it("ne throw pas si le display_name n'existe pas en base", async () => {
    // simule une reponse vide : aucun utilisateur avec ce display_name
    queryMock.mockResolvedValueOnce([]);

    await expect(checkDisplayNameAvailable("Nom Libre")).resolves.not.toThrow();
  });

  it("throw USER_DISPLAY_NAME_ALREADY_USED si le display_name est deja utilise", async () => {
    // simule une reponse avec un utilisateur existant
    queryMock.mockResolvedValueOnce([{ id: "uuid-existant" }]);

    await expect(checkDisplayNameAvailable("Nom Pris")).rejects.toThrow(
      new AppError(ERRORS.USER_DISPLAY_NAME_ALREADY_USED, 409),
    );
  });

  it("exclut l'utilisateur courant si excludeId est fourni (cas modification)", async () => {
    // simule une reponse vide
    queryMock.mockResolvedValueOnce([]);

    await expect(
      checkDisplayNameAvailable("Mon Nom", "mon-uuid"),
    ).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------

describe("checkUserExists", () => {
  it("ne throw pas si l'utilisateur existe en base", async () => {
    // simule une reponse avec un utilisateur existant
    queryMock.mockResolvedValueOnce([{ id: "uuid-existant" }]);

    await expect(checkUserExists("uuid-existant")).resolves.not.toThrow();
  });

  it("throw USER_NOT_FOUND si l'utilisateur n'existe pas", async () => {
    // simule une reponse vide : aucun utilisateur avec cet id
    queryMock.mockResolvedValueOnce([]);

    await expect(checkUserExists("uuid-inconnu")).rejects.toThrow(
      new AppError(ERRORS.USER_NOT_FOUND, 404),
    );
  });
});
