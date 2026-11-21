import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { isStrongPassword } from "@/utils/password";

export const updateProfile = async (req: Request, res: Response) => {
  const userId = res.locals.auth.userId as number | null;
  if (userId === null) {
    return res.status(403).json({ message: "Customers only" });
  }

  const name = String(req.body.name ?? "").trim();
  if (!name || name.length > 100) {
    return res.status(400).json({ message: "Please enter your name" });
  }

  const [user] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email });
  if (!user) {
    return res.status(404).json({ message: "Account not found" });
  }

  res.json({ ...user, role: "customer" });
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = res.locals.auth.userId as number | null;
  if (userId === null) {
    return res.status(403).json({ message: "Customers only" });
  }

  const currentPassword = String(req.body.currentPassword ?? "");
  const newPassword = String(req.body.newPassword ?? "");

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      message:
        "New password must be at least 8 characters and include 3 of: lowercase, uppercase, number, special character",
    });
  }
  if (newPassword.length > 72) {
    return res.status(400).json({ message: "New password is too long" });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return res.status(404).json({ message: "Account not found" });
  }

  
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) {
    return res.status(400).json({ message: "Current password is wrong" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

  res.json({ message: "Password updated" });
};