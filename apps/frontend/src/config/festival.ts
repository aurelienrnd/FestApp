/** Jours d'ouverture du festival — source de vérité unique pour les dates.*/
export const FESTIVAL_DAYS: string[] = [
  new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
];
