import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ENV } from "@/config/env";
import type { AuthUser } from "@/middleware/auth";
import { isStrongPassword } from "@/utils/password";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Gamiton kung walay user nga makita, aron parehas ang kadugayon sa pag-check
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const adminEmail = () => ENV.ADMIN_EMAIL.trim().toLowerCase();

const signToken = (
  payload: { role: "admin" | "customer"; userId?: number },
  expiresIn: "8h" | "7d"
) => jwt.sign(payload, ENV.JWT_SECRET, { expiresIn });

const errorCode = (err: unknown): string | undefined => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e?.code ?? e?.cause?.code;
};

export const signup = async (req: Request, res: Response) => {
  const name = String(req.body.name ?? "").trim();
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  if (!name || name.length > 100) {
    return res.status(400).json({ message: "Please enter your name" });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email" });
  }
  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include 3 of: lowercase, uppercase, number, special character",
    });
  }
  if (password.length > 72) {
    return res.status(400).json({ message: "Password is too long" });
  }
  if (email === adminEmail()) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash })
      .returning({ id: users.id, name: users.name, email: users.email });

    const token = signToken({ role: "customer", userId: user.id }, "7d");
    res.status(201).json({ token, user: { ...user, role: "customer" } });
  } catch (err) {
    if (errorCode(err) === "23505") {
      return res.status(409).json({ message: "Email is already registered" });
    }
    throw err;
  }
};

export const login = async (req: Request, res: Response) => {
  const email = String(req.body.email ?? "").trim().toLowerCase();
  const password = String(req.body.password ?? "");

  // Admin: gikan sa .env
  if (
    ENV.ADMIN_PASSWORD &&
    email === adminEmail() &&
    password === ENV.ADMIN_PASSWORD
  ) {
    const token = signToken({ role: "admin" }, "8h");
    return res.json({
      token,
      user: { name: "Admin", email: ENV.ADMIN_EMAIL, role: "admin" },
    });
  }

  // Customer: gikan sa database
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_HASH
  );
  if (!user || !valid) {
    return res.status(401).json({ message: "Wrong email or password" });
  }

  const token = signToken({ role: "customer", userId: user.id }, "7d");
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: "customer" },
  });
};

// Kinsa ang naka-login karon
export const me = async (req: Request, res: Response) => {
  const auth = res.locals.auth as AuthUser;

  if (auth.role === "admin") {
    return res.json({ name: "Admin", email: ENV.ADMIN_EMAIL, role: "admin" });
  }
  if (auth.userId === null) {
    return res.status(401).json({ message: "Invalid token" });
  }

  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);
  if (!user) {
    return res.status(401).json({ message: "Account not found" });
  }

  res.json({ ...user, role: "customer" });
};