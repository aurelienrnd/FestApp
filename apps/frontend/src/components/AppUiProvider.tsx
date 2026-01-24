"use client";
//Import
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

//Style
type AppUiState = {
  pathname?: string | null;
  isAdminPath: boolean;
  isDesktop: boolean;
};

//Context
const AppUiContext = createContext<AppUiState | null>(null);

/** Fournit un contexte global d’interface utilisateur (UI) à l’application.
 * Récupère l’URL pour déterminer si l’on est sur une page admin.
 * Détecte si l’affichage est en mode desktop via une media query.
 * Expose ces informations aux composants enfants via AppUiContext.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composants enfants ayant accès au contexte.
 */
export function AppUiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin") ?? false;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const handleChange = () => setIsDesktop(media.matches);

    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  return (
    <AppUiContext.Provider
      value={{
        pathname,
        isAdminPath,
        isDesktop,
      }}
    >
      {children}
    </AppUiContext.Provider>
  );
}

/** Accéde au contexte AppUiContext
 * @returns {AppUiContextType} Données UI partagées (pathname, isAdminPath, isDesktop, etc.).
 */
export function useAppUi() {
  const context = useContext(AppUiContext);
  return context;
}
