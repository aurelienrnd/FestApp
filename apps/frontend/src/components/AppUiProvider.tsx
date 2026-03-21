"use client";
//Import
import { usePathname } from "next/navigation";
import { createContext, useContext } from "react";

//Style
type AppUiState = {
  pathname?: string | null;
  isAdminPath: boolean;
};

//Context
const AppUiContext = createContext<AppUiState | null>(null);

/** Fournit un contexte global de navigation à l'application.
 * Récupère l'URL pour déterminer si l'on est sur une page admin.
 * Expose ces informations aux composants enfants via AppUiContext.
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composants enfants ayant accès au contexte.
 */
export function AppUiProvider({ children }: { children: React.ReactNode }) {
  // Récupère l'URL et détecte si on est sur une route admin (isAdminPath).
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin") ?? false;

  return (
    <AppUiContext.Provider
      value={{
        pathname,
        isAdminPath,
      }}
    >
      {children}
    </AppUiContext.Provider>
  );
}

/** Accéde au contexte AppUiContext
 * @returns {AppUiState} Données de navigation partagées (pathname, isAdminPath).
 */
export function useAppUi(): AppUiState {
  const context = useContext(AppUiContext);

  if (!context) {
    throw new Error("useAppUi must be used within AppUiProvider");
  }

  return context;
}
