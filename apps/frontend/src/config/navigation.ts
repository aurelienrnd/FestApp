/** Type d'un element de navigation — label affiché, chemin, état actif et callback optionnel. */
export type NavItem = {
  label?: string;
  labelBtn?: string;
  path?: string;
  active?: boolean;
  value?: string;
  role?: string;
  onClick?: () => void;
};

/** Liens affiches dans la navigation publique (visiteur non connecte). */
export const navVisitorItems: NavItem[] = [
  { label: "Accueil", path: "/" },
  { label: "Programmation", path: "/lineup" },
  { label: "Articles", path: "/news" },
  { label: "Information", path: "/practical-info" },
];

/** Liens affiches dans la navigation de l'espace administrateur. */
export const navAdminItem: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    role: "admin, lineup, news",
  },
  { label: "Programation", path: "/admin/lineup", role: "admin, lineup" },
  { label: "Articles", path: "/admin/news", role: "admin, news" },
  { label: "Utilisateurs", path: "/admin/users", role: "admin" },
  { labelBtn: "Logout", active: false },
];

/** Liens affiches dans la navigation de la page Dashboard. */
export const navDashBordItems: NavItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    role: "admin, lineup, news",
  },
  { label: "Programation", path: "/admin/lineup", role: "admin, lineup" },
  { label: "Articles", path: "/admin/news", role: "admin, news" },
  { label: "Utilisateurs", path: "/admin/users", role: "admin" },
];

/** Filtre les items de navigation selon le role de l'utilisateur connecte.
 * Les items sans champ `role` sont toujours inclus (ex : Logout).
 * @param {NavItem[]} items liste des items a filtrer
 * @param {string} role role de l'utilisateur connecte
 */
export function filterNavByRole(items: NavItem[], role: string): NavItem[] {
  return items.filter(
    (item) => !item.role || item.role.split(", ").includes(role),
  );
}

import { FESTIVAL_DAYS } from "./festival";

/** Filtres affiches dans la navigation de la page LineUp et admin/Lineup.
 * Genere un bouton par jour du festival depuis FESTIVAL_DAYS.
 */
export const filterLineUpItems: NavItem[] = [
  { labelBtn: "Toutes les dates", active: true },
  ...FESTIVAL_DAYS.map((d) => ({
    labelBtn: new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    }),
    active: false,
    value: d,
  })),
];

/** Filtres affiches dans la navigation de la page News et admin/News. */
export const filterNewsItems: NavItem[] = [
  { labelBtn: "Toutes les news", active: true },
  { labelBtn: "Croissant", active: false },
  { labelBtn: "Decroissant", active: false },
];

/** Filtres affiches dans la navigation de la admin/Users. */
export const filterUsersItems: NavItem[] = [
  { labelBtn: "Tout", active: true, value: "all" },
  { labelBtn: "Admin", active: false, value: "admin" },
  { labelBtn: "Line Up", active: false, value: "lineup" },
  { labelBtn: "News", active: false, value: "news" },
];
