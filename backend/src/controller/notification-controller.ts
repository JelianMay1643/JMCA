import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as repo from "@/repositories/notification-repository";

const auth = (res: Response) => res.locals.auth as AuthUser;

export const listNotifications = async (_req: Request, res: Response) => {
  res.json(await repo.list(auth(res)));
};

export const readNotification = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ message: "Notification not found" });
  }
  await repo.markRead(auth(res), id);
  res.json({ ok: true });
};

export const readAllNotifications = async (_req: Request, res: Response) => {
  await repo.markAllRead(auth(res));
  res.json({ ok: true });
};