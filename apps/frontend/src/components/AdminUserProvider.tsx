"use client";

import { createContext, useContext } from "react";
import type { AdminSessionResponse } from "../type";

// Context partage dans l'espace admin
const AdminUserContext = createContext<AdminSessionResponse | null>(null);

/** Fournit les donnees utilisateur admin aux pages enfants.
 * Recoit la reponse de /admin/auth/get-session puis la rend accessible via le context.
 * @param {Object} props
 * @param {AdminSessionResponse} props.value Donnees utilisateur de la session active.
 * @param {React.ReactNode} props.children Composants enfants de l'espace admin.
 */
export function AdminUserProvider({
  value,
  children,
}: {
  value: AdminSessionResponse;
  children: React.ReactNode;
}) {
  return (
    <AdminUserContext.Provider value={value}>
      {children}
    </AdminUserContext.Provider>
  );
}

/** Accede au context admin utilisateur.
 * Retourne null si appele hors AdminUserProvider (ex : layouts public et auth).
 */
export function useAdminUser(): AdminSessionResponse | null {
  return useContext(AdminUserContext);
}
