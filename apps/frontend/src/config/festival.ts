/** Jours d'ouverture du festival — source de vérité unique pour les dates.*/
export const FESTIVAL_DAYS: string[] = [
  new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
];

/** Lieu du festival — source de vérité unique pour l'adresse. */
export const FESTIVAL_LOCATION = {
  name: "Salle des Fins Bois",
  address: "8 rue de la Serraide",
  city: "16400 Vindelle",
};
