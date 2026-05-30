"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminUser } from "../components/AdminUserProvider";
import { useNavPath } from "./useNavPath";
import { navAdminItem } from "../config/ui";

/** Redirige vers /admin/dashboard si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante.
 * Doit être appelé uniquement dans les enfants de AdminUserProvider.
 * @fonction useAdminUser recupère l'utilisateur admin depuis le contexte, il peut être null au début du chargement, le useEffect va se déclencher à nouveau une fois que adminUser sera défini
 * @fonction useNavPath recupère la route courante
 */
export function useRoleGuard() {
  // on récupère l'utilisateur admin et la route courante
  const adminUser = useAdminUser();
  const { pathname } = useNavPath();
  const router = useRouter();

  // on vérifie si l'utilisateur a le droit d'accéder à la route courante
  useEffect(() => {
    // admin user est fait appel a un contexte, il peut être null au début du chargement, le useEffect va se déclencher à nouveau une fois que adminUser sera défini
    if (!adminUser) return;

    // voir si la route courante a une restriction de rôle
    const currentItem = navAdminItem.find(
      (item) => item.path === pathname || pathname.startsWith(item.path + "/"),
    );

    // si la route courante n'a pas de restriction de rôle, on ne fait rien
    if (!currentItem?.role) return;

    // redirect si le rôle de l'utilisateur ne lui permet pas d'accéder à la route courante
    const allowedRoles = currentItem.role.split(", ");
    if (!allowedRoles.includes(adminUser.user.role)) {
      router.replace("/admin/dashboard");
    }
  }, [adminUser, pathname, router]);
}
