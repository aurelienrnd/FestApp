/** Retourne `true` si la valeur est vide ou ne contient que des espaces.
 * @param {string} value Valeur à vérifier.
 * @return {boolean} `true` si la valeur est vide ou ne contient que des espaces, sinon `false`.
 */
export function isEmpty(value: string): boolean {
  return value.trim() === "";
}
