"use client";
// Import
import { useEffect } from "react";
import { useAppUi } from "./AppUiProvider";

/** Change le thème de l’application (admin ou visitor) en fonction de l’URL.
 * Utilise usePathname pour récupérer l’URL de la page.
 * Au montage du composant, vérifie si "admin" ou "login" est présent dans l’URL.
 * Modifie la balise <html> via root pour ajuster le thème (couleurs, styles, etc.).
 */
export default function ThemeVars() {
  const { pathname } = useAppUi();
  const path = pathname ?? "";

  useEffect(() => {
    const isAdmin = path.includes("/admin") || path.includes("/login");
    const root = document.documentElement;

    root.dataset.theme = isAdmin ? "admin" : "visitor";
  }, [path]);

  return null;
}
