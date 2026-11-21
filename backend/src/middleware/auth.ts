import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "@/config/env";

export type AuthUser = {
  role: "admin" | "customer";
  userId: number | null;
};

const readToken = (req: Request) => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice(7) : null;
};

// Kinahanglan naka-login (customer o admin)
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = readToken(req);
  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET);
    if (
      typeof payload === "string" ||
      (payload.role !== "admin" && payload.role !== "customer")
    ) {
      throw new Error("Invalid token");
    }

    const auth: AuthUser = {
      role: payload.role,
      userId: typeof payload.userId === "number" ? payload.userId : null,
    };
    res.locals.auth = auth;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin ra
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requireAuth(req, res, () => {
    if (res.locals.auth.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    next();
  });
};

// Customer ra (ang admin dili maka-order)
export const requireCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requireAuth(req, res, () => {
    if (res.locals.auth.role !== "customer") {
      return res
        .status(403)
        .json({ message: "Only customers can place orders" });
    }
    next();
  });
};