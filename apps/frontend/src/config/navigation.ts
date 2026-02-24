// Type
export type NavItem = {
  label: string;
  path: string;
};

// Liens affiches dans la navigation publique (visiteur non connecte).
export const navVisitorItems: NavItem[] = [
  { label: "Accueil", path: "/" },
  { label: "Programmation", path: "/lineup" },
  { label: "Articles", path: "/news" },
  { label: "Information", path: "/practical-info" },
];

// Liens affiches dans la navigation de l'espace administrateur.
export const navAdminItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Programmation", path: "/admin/lineup" },
  { label: "Articles", path: "/admin/news" },
  { label: "Utilisateurs", path: "/admin/users" },
  { label: "Logout", path: "/../login" },
];
