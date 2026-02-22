import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/** Wrappe un handler async et transfere les erreurs vers `next(error)`. */
export function asyncHandler(handler: AsyncMiddleware): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}
