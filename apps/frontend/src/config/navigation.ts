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
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Programmation", path: "/admin/lineup" },
  { label: "Articles", path: "/admin/news" },
  { label: "Utilisateurs", path: "/admin/users" },
  { label: "Logout", path: "/../login" },
];
