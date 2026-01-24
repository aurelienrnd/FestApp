export type NavItem = {
  label: string;
  path: string;
};

export const navVisitorItems: NavItem[] = [
  { label: "Accueil", path: "/" },
  { label: "Programmation", path: "/lineup" },
  { label: "Articles", path: "/news" },
  { label: "Information", path: "/practical-info" },
];

export const navAdminItems: NavItem[] = [
  { label: "Dashboard", path: "/" },
  { label: "Programmation", path: "/lineup" },
  { label: "Articles", path: "/news" },
  { label: "Utilisateurs", path: "/practical-info" },
  { label: "Logout", path: "/../login" },
];
