"use client";
// Import
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Change le thème de l’application (admin ou visitor) en fonction de l’URL.
 * Utilise usePathname pour récupérer l’URL de la page.
 * Au montage du composant, vérifie si "admin" ou "login" est présent dans l’URL.
 * Modifie la balise <html> via root pour ajuster le thème (couleurs, styles, etc.).
 */
export default function ThemeVars() {
  const pathname = usePathname() ?? "";

  useEffect(() => {
    const isAdmin = pathname.includes("/admin") || pathname.includes("/login");
    const root = document.documentElement;

    root.dataset.theme = isAdmin ? "admin" : "visitor";
  }, [pathname]);

  return null;
}
