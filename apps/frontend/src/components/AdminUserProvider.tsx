"use client";

import { createContext, useContext } from "react";
import type { AdminAuthMeResponse } from "../type";

// Context partage dans l'espace admin
const AdminUserContext = createContext<AdminAuthMeResponse | null>(null);

/** Fournit les donnees utilisateur admin aux pages enfants.
 * Recoit la reponse de /admin/auth/me puis la rend accessible via le context.
 * @param {Object} props
 * @param {AdminAuthMeResponse} props.value Donnees utilisateur et indicateur mustChangePassword.
 * @param {React.ReactNode} props.children Composants enfants de l'espace admin.
 */
export function AdminUserProvider({
  value,
  children,
}: {
  value: AdminAuthMeResponse;
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
export function useAdminUser(): AdminAuthMeResponse | null {
  return useContext(AdminUserContext);
}
