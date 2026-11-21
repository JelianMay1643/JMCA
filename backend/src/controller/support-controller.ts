import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as supportRepo from "@/repositories/support-repository";

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const createTicket = async (req: Request, res: Response) => {
  const userId = (res.locals.auth as AuthUser).userId as number;
  const subject = String(req.body?.subject ?? "").trim();
  const message = String(req.body?.message ?? "").trim();

  if (subject.length < 3 || subject.length > 100) {
    return res
      .status(400)
      .json({ message: "Subject must be 3 to 100 characters" });
  }
  if (message.length < 5 || message.length > 1000) {
    return res
      .status(400)
      .json({ message: "Message must be 5 to 1000 characters" });
  }

  try {
    res.status(201).json(await supportRepo.create(userId, subject, message));
  } catch (err) {
    if (err instanceof supportRepo.SupportError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

export const myTickets = async (_req: Request, res: Response) => {
  const userId = (res.locals.auth as AuthUser).userId as number;
  res.json(await supportRepo.listMine(userId));
};

export const listTickets = async (_req: Request, res: Response) => {
  res.json(await supportRepo.listAll());
};

export const replyTicket = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const text = String(req.body?.reply ?? "").trim();

  if (id === null) {
    return res.status(404).json({ message: "Ticket not found" });
  }
  if (text.length < 1 || text.length > 1000) {
    return res
      .status(400)
      .json({ message: "Reply must be 1 to 1000 characters" });
  }

  try {
    res.json(await supportRepo.reply(id, text));
  } catch (err) {
    if (err instanceof supportRepo.SupportError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

export const closeTicket = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  try {
    res.json(await supportRepo.close(id));
  } catch (err) {
    if (err instanceof supportRepo.SupportError) {
      return res.status(404).json({ message: err.message });
    }
    throw err;
  }
};