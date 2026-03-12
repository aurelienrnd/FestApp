"use client";

import { createContext, useContext } from "react";

// Type utilisateur renvoye par l'API admin/auth/me
export type AdminUser = {
  id: string;
  email: string;
  display_name: string;
  role: string;
};

// Type global de la reponse de l'endpoint admin/auth/me
export type AdminAuthMeResponse = {
  user: AdminUser;
  mustChangePassword: boolean;
};

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

/** Accede au context admin utilisateur */
export function useAdminUser() {
  const context = useContext(AdminUserContext);

  if (!context) {
    throw new Error("useAdminUser must be used within AdminUserProvider");
  }

  return context;
}
