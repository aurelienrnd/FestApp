/** Type d'un element de navigation — label affiché, chemin, état actif et callback optionnel. */
export type NavItem = {
  label?: string;
  labelBtn?: string;
  path?: string;
  active?: boolean;
  value?: string;
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
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Programmation", path: "/admin/lineup" },
  { label: "Articles", path: "/admin/news" },
  { label: "Utilisateurs", path: "/admin/users" },
  { labelBtn: "Logout", active: false },
];

/** Liens affiches dans la navigation de la page Dashboard. */
export const navDashBordItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Programmation", path: "/admin/lineup" },
  { label: "Articles", path: "/admin/news" },
  { label: "Utilisateurs", path: "/admin/users" },
];

/** Filtres affiches dans la navigation de la page LineUp et admin/Lineup. */
export const filterLineUpItems: NavItem[] = [
  { labelBtn: "Toutes les dates", active: true },
  { labelBtn: "Jours: 1", active: false },
  { labelBtn: "Jours: 2", active: false },
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
