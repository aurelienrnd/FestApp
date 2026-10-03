import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

/** Remplace le module sharp par un mock pour les tests.
 * Simule l'appel sharp(file) via l'export default.
 * Simule la conversion en webp.
 * Mocke toBuffer et toFile pour ne jamais traiter ni ecrire de vraie image.
 */
vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn(() => ({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from("")),
      toFile: vi.fn().mockResolvedValue(undefined),
    })),
  })),
}));

/** Remplace le module fs/promises par un mock pour les tests.
 * Importe toutes les méthodes réelles de fs/promises via importOriginal.
 * Remplace writeFile, unlink et mkdir pour ne pas toucher le disque pendant les tests.
 */
vi.mock("fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs/promises")>();
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
});

/** Remplace express-rate-limit par un middleware passthrough pour les tests.
 * Appelle simplement next() pour laisser passer toutes les requêtes sans appliquer de limitation de taux.
 */
vi.mock("express-rate-limit", () => ({
  default: () => (_req: unknown, _res: unknown, next: () => void) => next(),
}));

/** Remplace le module nodemailer par un mock pour les tests.
 * Simule l'objet nodemailer.
 * simule la méthode createTransport.
 * simule la fonction sendMail pour qu'elle résolve une promesse avec un messageId de test.
 */
vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
    })),
  },
}));

/** Charge les variables d'environnement pour le contexte de test.
 * Charge d'abord les variables de .env.backend,
 * puis les variables de .env.test qui peuvent écraser celles de .env.backend si nécessaire.
 */
dotenv.config({ path: path.resolve(process.cwd(), ".env.backend") });
process.env.DB_NAME = "vindhellfest_test";

// Crée une instance de Pool pour se connecter à la base de données de test en utilisant les variables d'environnement chargées.
const testPool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Le schema de la base de test est cree une seule fois par tests/setupTestDb.ts, avant tout import.

/** Nettoie la base de données de test après chaque test.
 * Exécute une requête TRUNCATE pour effacer toutes les données des tables.
 */
afterEach(async () => {
  await testPool.query(
    'TRUNCATE "user", session, account, verification, news, concerts, artists RESTART IDENTITY CASCADE;',
  );
});

/** Ferme la connexion à la base de données de test après tous les tests. */
afterAll(async () => {
  await testPool.end();
});
