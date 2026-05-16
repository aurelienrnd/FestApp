import dotenv from "dotenv";
import path from "path";
import fs from "node:fs";
import { Pool } from "pg";

// Mocks globaux — vi.mock est hoisté en tête de fichier par Vitest,
// ces mocks sont actifs avant tout import dans les fichiers de test.

vi.mock("sharp", () => ({
  default: vi.fn(() => ({
    webp: vi.fn(() => ({
      toBuffer: vi.fn().mockResolvedValue(Buffer.from("")),
    })),
  })),
}));

vi.mock("fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs/promises")>();
  return {
    ...actual,
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: vi.fn().mockResolvedValue({ messageId: "test-message-id" }),
    })),
  },
}));

// Charge .env.backend puis écrase DB_NAME avec .env.test
dotenv.config({ path: path.resolve(process.cwd(), ".env.backend") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.test"), override: true });

// Pool dédié au setup — séparé du pool de l'app (db.ts)
const testPool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const MIGRATIONS_DIR = path.resolve(process.cwd(), "bd/init");

const MIGRATION_FILES = [
  "01_user_schema.sql",
  "02_sessions_schema.sql",
  "03_news_schema.sql",
  "04_artist_schema.sql",
  "05_concert_schema.sql",
];

beforeAll(async () => {
  for (const file of MIGRATION_FILES) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
    await testPool.query(sql);
  }
});

afterEach(async () => {
  await testPool.query(
    "TRUNCATE sessions, news, concerts, artists, users RESTART IDENTITY CASCADE;",
  );
});

afterAll(async () => {
  await testPool.end();
});
