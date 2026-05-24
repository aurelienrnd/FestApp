import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

/** Chemin absolu du dossier de stockage des images artistes. */
export const ARTISTS_UPLOADS_DIR = path.join(
  __dirname,
  "../../uploads/artists",
);

/** Chemin absolu du dossier de stockage des images news. */
export const NEWS_UPLOADS_DIR = path.join(__dirname, "../../uploads/news");

/** Genere un nom de fichier unique, cree le dossier si absent, redimensionne a 1600px max,
 * convertit le buffer en WebP (qualite 80) et ecrit le fichier sur le disque.
 * @param buffer contenu brut du fichier image recu dans req.file.buffer
 * @param uploadsDir chemin absolu du dossier de destination
 * @param urlPrefix prefixe d'URL publique (ex: /uploads/artists)
 * @returns URL publique du fichier ecrit (ex: /uploads/artists/uuid.webp)
 */
export async function saveImage(
  buffer: Buffer,
  uploadsDir: string,
  urlPrefix: string,
): Promise<string> {
  const uuid = randomUUID();
  const filename = `${uuid}.webp`;
  const filepath = path.join(uploadsDir, filename);
  const url_media = `${urlPrefix}/${filename}`;
  await mkdir(uploadsDir, { recursive: true });
  await sharp(buffer)
    .resize(1600, undefined, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(filepath);
  return url_media;
}

/** Supprime silencieusement une image du disque a partir de son URL publique.
 * A appeler apres le COMMIT de la transaction pour conserver l'ancienne image en cas d'erreur SQL.
 * @param uploadsDir chemin absolu du dossier contenant l'image
 * @param urlMedia URL publique de l'image a supprimer (ex: /uploads/artists/uuid.webp)
 */
export async function deleteImage(
  uploadsDir: string,
  urlMedia: string,
): Promise<void> {
  const filename = path.basename(urlMedia);
  const filepath = path.join(uploadsDir, filename);
  await unlink(filepath).catch(() => undefined);
}
