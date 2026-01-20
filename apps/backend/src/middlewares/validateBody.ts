// Middleware to validate the request body via a Zod schema.
import type { Request, Response, NextFunction } from "express";
import * as z from "zod";

/** Returns an Express middleware that validates req.body.
 * If validation fails, a 400 response is returned.
 * @param schema Zod schema used to validate the request body.
 * @returns Express middleware with validated data.
 */
export function validateBody(schema: z.ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      return next();
    } catch (error) {
      console.error(error);
      const err =
        error instanceof z.ZodError
          ? new Error("Données invalides")
          : error instanceof Error
            ? error
            : new Error("Données invalides");
      return res.status(400).json({ error: err.message });
    }
  };
}
