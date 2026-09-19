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
