import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../errors/AppError";

/** Middleware de fin de chaine pour les routes non trouvees.
 * Il est execute uniquement si aucune route precedente n'a repondu.
 * Renvoie une erreur HTTP 404 avec la methode et l'URL demandee.
 */
export const notFoundHandler: RequestHandler = (req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

/** Middleware global de gestion des erreurs Express.
 * Recoit les erreurs remontees par `next(err)` ou lancees dans les handlers.
 * Si l'erreur est une `AppError`, renvoie son `status` et son `message`.
 * Sinon, renvoie une erreur generique 500 pour eviter d'exposer des details internes.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
};
