import type { UserRole } from "../type.js";

/** Indique si le role de l'utilisateur lui donne acces aux news non publiees.
 * @param userRole role de l'utilisateur courant
 */
export function isNewsPrivileged(userRole?: UserRole): boolean {
  return userRole === "admin" || userRole === "news";
}
