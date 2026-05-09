/** Formate une date ISO en français long (ex : "9 mai 2026").
 * @param {string} isoString Date ISO 8601.
 */
export function formatDateLong(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
