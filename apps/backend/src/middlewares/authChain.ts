import type { RequestHandler } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { auth } from "./auth.js";
import { requireRole } from "./requireRole.js";
import type { UserRole } from "../type.js";

/** Retourne la chaine de middlewares d'authentification admin :
 * verification de la session Better Auth, puis controle du role.
 * @param roles liste des roles autorises a acceder a la route
 */
export function adminAuth(...roles: UserRole[]): RequestHandler[] {
  return [asyncHandler(auth), requireRole(...roles)];
}
