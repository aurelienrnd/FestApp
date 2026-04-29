"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminUser } from "../components/AdminUserProvider";
import { useNavPath } from "./useNavPath";
import { navAdminItem } from "../config/ui";

/** Redirige vers /admin/dashboard si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante.
 * Doit être appelé uniquement dans les enfants de AdminUserProvider.
 */
export function useRoleGuard() {
  const adminUser = useAdminUser();
  const { pathname } = useNavPath();
  const router = useRouter();

  useEffect(() => {
    if (!adminUser) return;

    // voir si la route courante a une restriction de rôle
    const currentItem = navAdminItem.find((item) => item.path === pathname);
    if (!currentItem?.role) return;

    // redirect si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante
    const allowedRoles = currentItem.role.split(", ");
    if (!allowedRoles.includes(adminUser.user.role)) {
      router.replace("/admin/dashboard");
    }
  }, [adminUser, pathname, router]);
}
