import dotenv from "dotenv";
import path from "path";
import fs from "node:fs";
import { Pool } from "pg";

// Définit le chemin vers le répertoire contenant les fichiers de migration SQL.
const MIGRATIONS_DIR = path.resolve(process.cwd(), "bd/init");

// Liste des fichiers de migration à exécuter pour préparer la base de données de test.
const MIGRATION_FILES = [
  "01_auth_schema.sql",
  "03_news_schema.sql",
  "04_artist_schema.sql",
  "05_concert_schema.sql",
];

/** Prépare la base de données de test une seule fois, avant l'import du premier fichier de test.
 * Better Auth verifie le schema de la base des la creation de l'instance auth (a l'import de l'app)
 * et garde en cache une eventuelle erreur : le schema doit donc exister AVANT tout import,
 * ce qu'un beforeAll dans setup.ts ne garantit pas.
 * Reinitialise le schema public avant de rejouer les migrations : 01_auth_schema.sql n'a pas
 * de DROP TABLE IF EXISTS (contrairement aux 3 autres fichiers) — il est genere par la CLI
 * Better Auth pour un volume Postgres neuf, pas pour etre rejoue a chaque lancement.
 */
export default async function setup() {
  dotenv.config({
    path: path.resolve(process.cwd(), ".env.backend"),
    quiet: true,
  });

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "vindhellfest_test",
  });

  try {
    await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");

    for (const file of MIGRATION_FILES) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf-8");
      await pool.query(sql);
    }
  } finally {
    await pool.end();
  }
}
