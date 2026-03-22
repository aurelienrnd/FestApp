import multer from "multer";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

/** Middleware multer configure en memoryStorage.
 * Garde le fichier en memoire sous forme de Buffer pour le passer a sharp.
 * Accepte uniquement image/jpeg, image/png et image/webp.
 * Limite la taille a 5 Mo.
 */
export const upload = multer({
  // Utilise memoryStorage pour garder le fichier en memoire sous forme de Buffer.
  storage: multer.memoryStorage(),

  // Limite la taille du fichier a 5 Mo.
  limits: { fileSize: MAX_SIZE_BYTES },

  // Filtre les fichiers pour n'accepter que les types d'images autorisés.
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("INVALID_FILE_TYPE"));
    }
  },
});
