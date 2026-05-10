/** Retourne `true` si la valeur est vide ou ne contient que des espaces.
 * @param {string} value Valeur à vérifier.
 */
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}
