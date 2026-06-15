import type { RequestHandler } from "express";
import { asyncHandler } from "./asyncHandler";
import { auth } from "./auth";
import { sessionIsOpen } from "./sessionIsOpen";
import { requireRole } from "./requireRole";
import type { UserRole } from "../type";

/** Retourne la chaine de middlewares d'authentification admin :
 * verification du JWT, validation de la session, puis controle du role.
 * @param roles liste des roles autorises a acceder a la route
 */
export function adminAuth(...roles: UserRole[]): RequestHandler[] {
  return [
    asyncHandler(auth),
    asyncHandler(sessionIsOpen),
    requireRole(...roles),
  ];
}
