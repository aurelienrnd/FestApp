import path from "path";
import { mkdir, unlink } from "fs/promises";
import sharp from "sharp";
import { saveImage, deleteImage } from "../../src/services/imageUpload.service";

// simule le type des mocks pour eviter les erreurs de typage
const sharpMock = vi.mocked(sharp);
const mkdirMock = vi.mocked(mkdir);
const unlinkMock = vi.mocked(unlink);

// ---------------------------------------------------------------------------

describe("saveImage", () => {
  it("appelle mkdir avec recursive: true avant l'ecriture", async () => {
    // simule une reussite de mkdir (dossier deja existant ou cree avec succes)
    const buffer = Buffer.from("fake");
    await saveImage(buffer, "/uploads/artists", "/uploads/artists");

    expect(mkdirMock).toHaveBeenCalledWith("/uploads/artists", {
      recursive: true,
    });
  });

  it("appelle sharp().resize().webp().toFile() avec le bon chemin", async () => {
    // simule une reussite de mkdir (dossier deja existant ou cree avec succes)
    const buffer = Buffer.from("fake");
    await saveImage(buffer, "/uploads/artists", "/uploads/artists");

    // verifie que sharp a ete appele avec le buffer
    expect(sharpMock).toHaveBeenCalledWith(buffer);

    // navigation dans la chaine de mocks via .mock.results sans rappeler les fonctions :
    // sharp(buffer)              → results[0].value = { resize: vi.fn(), webp: vi.fn() }
    // .resize(...) (mockReturnThis) → retourne le meme sharpInstance
    // .webp(...)                 → results[0].value = { toBuffer: vi.fn(), toFile: vi.fn() }
    // .toFile(chemin)            → la fonction a verifier
    const sharpInstance = sharpMock.mock.results[0].value;

    expect(vi.mocked(sharpInstance.resize)).toHaveBeenCalledWith(
      1600,
      undefined,
      { fit: "inside", withoutEnlargement: true },
    );

    const webpInstance = vi.mocked(sharpInstance.webp).mock.results[0].value;

    expect(vi.mocked(webpInstance.toFile)).toHaveBeenCalledWith(
      expect.stringMatching(/\/uploads\/artists\/.+\.webp$/),
    );
  });

  it("retourne une URL publique au format /prefix/uuid.webp", async () => {
    // simule une reussite de mkdir (dossier deja existant ou cree avec succes)
    const buffer = Buffer.from("fake");

    // simule le chemind ou l'image serait sauvegardee
    const url = await saveImage(buffer, "/tmp/artists", "/uploads/artists");

    expect(url).toMatch(/^\/uploads\/artists\/.+\.webp$/);
  });

  it("chaque appel retourne une URL differente (UUID unique)", async () => {
    // simule une reussite de mkdir (dossier deja existant ou cree avec succes)
    const buffer = Buffer.from("fake");

    // simule le chemind ou l'image serait sauvegardee
    const url1 = await saveImage(buffer, "/tmp/artists", "/uploads/artists");
    const url2 = await saveImage(buffer, "/tmp/artists", "/uploads/artists");

    expect(url1).not.toBe(url2);
  });
});

// ---------------------------------------------------------------------------

describe("deleteImage", () => {
  it("appelle unlink avec le bon chemin reconstruit depuis l'URL", async () => {
    // simule la suppression de l'image
    const uploadsDir = "/uploads/artists";
    const urlMedia = "/uploads/artists/mon-image.webp";
    await deleteImage(uploadsDir, urlMedia);

    expect(unlinkMock).toHaveBeenCalledWith(
      path.join(uploadsDir, "mon-image.webp"),
    );
  });

  it("ne throw pas si unlink echoue (silent fail)", async () => {
    // simule une erreur de suppression (fichier absent)
    unlinkMock.mockRejectedValueOnce(new Error("ENOENT"));

    await expect(
      deleteImage("/uploads/artists", "/uploads/artists/absent.webp"),
    ).resolves.not.toThrow();
  });
});
