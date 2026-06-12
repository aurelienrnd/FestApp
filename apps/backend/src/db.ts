/** imports */
import { Pool, QueryResultRow } from "pg";
import dotenv from "dotenv";

dotenv.config(); // charge .env.backend & .env (depuis Docker/env_file)

// Configuration de la connexion à la base de données PostgreSQL
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "vindhellfest",
});

/** Execute une requete SQL pour recuperer des donnees depuis la base postgresql.
 * @param {string} text Requete SQL exemple : 'SELECT * FROM users WHERE id = $1'
 * @param {unknown[]} params Parametres de la requete SQL
 * @returns {Promise<T[]>} Liste des lignes retournees par la requete SQL
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pool.query<T>(text, params);
  //console.log(result.rows);
  return result.rows;
}
