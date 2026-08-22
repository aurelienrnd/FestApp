import type { StringValue } from "ms";

/** Verifie si la variable d'environnement existe et renvoie une erreur si non
 * Permet de gerer les erreur de typage
 * @param {string} name nom de la variable d'environnement
 * @returns {string}
 */
export function getEnv(name: string): string {
  const variables = process.env[name];
  if (!variables) throw new Error(`Missing env var: ${name}`);
  return variables;
}

/** Permet d'ajouter le type StringValue a une variable d'environnement
 * ou lance une erreur si ce n'est pas possible
 * @param {string} name nom de la variable d'environnement
 * @returns {StringValue}
 */
export function envToStringValue(name: string): StringValue {
  const value = getEnv(name);
  if (!/^\d+(\s?[a-zA-Z]+)?$/.test(value)) {
    throw new Error(`Invalid duration for ${name}`);
  }
  return value as StringValue;
}
