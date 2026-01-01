import rateLimit from "express-rate-limit";

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
    error: "Trop de tentatives, réessayer plus tard",
  },
});
