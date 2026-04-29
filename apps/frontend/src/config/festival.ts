/** Jours d'ouverture du festival — source de vérité unique pour les dates.*/
export const FESTIVAL_DAYS: string[] = [
  new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
];

/** URL de la billetterie — source de vérité unique pour le lien d'achat. */
export const TICKETING_URL =
  "https://www.google.com/search?q=tiket+master&rlz=1C1ONGR_frFR1184FR1184&oq=tiket+master&gs_lcrp=EgZjaHJvbWUyBggAEEUYOdIBCDM1ODJqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8";

/** Lieu du festival — source de vérité unique pour l'adresse. */
export const FESTIVAL_LOCATION = {
  name: "Salle des Fins Bois",
  address: "8 rue de la Serraide",
  city: "16400 Vindelle",
};
