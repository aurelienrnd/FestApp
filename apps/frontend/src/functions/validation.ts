/** Retourne `true` si la valeur est vide ou ne contient que des espaces.
 * @param {string} value Valeur à vérifier.
 */
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}

/** Retourne `true` si la valeur respecte le format email.
 * @param {string} value Valeur à vérifier.
 */
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Retourne `true` si la valeur (après trim) dépasse la longueur maximale autorisée.
 * @param {string} value Valeur à vérifier.
 * @param {number} max Longueur maximale.
 */
export function isMaxLength(value: string, max: number): boolean {
  return value.trim().length > max;
}
