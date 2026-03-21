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
  // Récupèrent l’URL, détectent si on est sur une route admin (isAdminPath), et determine si l’écran est en mode desktop (isDesktop).
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin") ?? false;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Crée un objet qui surveille si l’écran fait au moins
    const media = window.matchMedia("(min-width: 768px)");

    // Définit une fonction qui met isDesktop à true ou false Puis l'exécute pour initialiser l’état tout de suite.
    const handleChange = () => setIsDesktop(media.matches);
    handleChange();

    // declanche handleChange si l'ecran change
    media.addEventListener("change", handleChange);

    // Nettoie l’écouteur quand le composant est démonté.
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
export function useAppUi(): AppUiState {
  const context = useContext(AppUiContext);

  if (!context) {
    throw new Error("useAppUi must be used within AppUiProvider");
  }

  return context;
}
