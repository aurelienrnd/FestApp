import { randomUUID } from "crypto";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import sharp from "sharp";

/** Genere un nom de fichier unique, cree le dossier si absent, convertit le buffer en WebP (qualite 80) et ecrit le fichier sur le disque.
 * @param {Buffer} buffer contenu brut du fichier image recu dans req.file.buffer
 * @param {string} uploadsDir chemin absolu du dossier de destination
 * @param {string} urlPrefix prefixe d'URL publique (ex: /uploads/artists)
 * @returns {Promise<string>} URL publique du fichier ecrit (ex: /uploads/artists/uuid.webp)
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
  await sharp(buffer).webp({ quality: 80 }).toFile(filepath);
  return url_media;
}

/** Supprime silencieusement une image du disque a partir de son URL publique.
 * A appeler apres le COMMIT de la transaction pour conserver l'ancienne image en cas d'erreur SQL.
 * @param {string} uploadsDir chemin absolu du dossier contenant l'image
 * @param {string} urlMedia URL publique de l'image a supprimer (ex: /uploads/artists/uuid.webp)
 */
export async function deleteImage(
  uploadsDir: string,
  urlMedia: string,
): Promise<void> {
  const filename = path.basename(urlMedia);
  const filepath = path.join(uploadsDir, filename);
  await unlink(filepath).catch(() => undefined);
}
