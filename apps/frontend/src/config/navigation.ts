export type NavItem = {
  label: string;
  path: string;
};

export const navItems: NavItem[] = [
  { label: "Accueil", path: "/" },
  { label: "Programmation", path: "/lineup" },
  { label: "Articles", path: "/news" },
  { label: "Information", path: "/practical-info" },
];
