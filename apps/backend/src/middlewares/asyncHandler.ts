import type { NextFunction, Request, RequestHandler, Response } from "express";

/** Wrappe un handler async et transfere les erreurs vers `next(error)`. */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
