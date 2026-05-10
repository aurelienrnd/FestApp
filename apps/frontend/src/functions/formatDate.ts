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

/** Formate une date ISO en date et heure séparées pour l'affichage d'un concert.
 * @param {string} isoString Date ISO 8601.
 * @returns {{ date: string, time: string }} date au format "samedi 23 août", time au format "20:00".
 */
export function formatConcertDatetime(isoString: string): {
  date: string;
  time: string;
} {
  const d = new Date(isoString);
  return {
    date: d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    time: d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}
