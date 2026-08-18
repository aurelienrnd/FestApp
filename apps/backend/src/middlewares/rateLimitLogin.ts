import rateLimit from "express-rate-limit";
import { ERRORS } from "../errors/errorMessages.js";

/** Middleware de limitation de tentatives de connexion
 * express-rate-limit retourne un middleware, du coup on l'appelle directement sans utiliser les paramètres req, res, next
 * Limite à 5 tentatives toutes les 10 minutes par IP
 * @returns Middleware(res, req, next)
 */
export const rateLimitLogin = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutesdelware
  max: 5, // 5 tentatives
  standardHeaders: true, // ajoute les headers RateLimit-*
  legacyHeaders: false, // ajoute au header 5-RateLimit-*
  message: {
    error: ERRORS.RATE_LIMIT_TOO_MANY_ATTEMPTS,
  },
});
