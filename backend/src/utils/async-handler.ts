import type { NextFunction, Request, RequestHandler, Response } from "express";

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

// Aron ma-catch ang error sa async functions
export const asyncHandler =
  (fn: Handler): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };