import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as refundRepo from "@/repositories/refund-repository";

export const requestRefund = async (req: Request, res: Response) => {
  const userId = (res.locals.auth as AuthUser).userId as number;
  const orderId = String(req.params.orderId);
  const reason = String(req.body?.reason ?? "").trim().slice(0, 300);

  try {
    res.status(201).json(await refundRepo.request(userId, orderId, reason));
  } catch (err) {
    if (err instanceof refundRepo.RefundError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

export const listRefunds = async (_req: Request, res: Response) => {
  res.json(await refundRepo.listAll());
};

export const decideRefund = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const status = req.body?.status;
  const adminNote = String(req.body?.adminNote ?? "").trim().slice(0, 300);

  if (!Number.isInteger(id) || id < 1) {
    return res.status(404).json({ message: "Refund not found" });
  }
  if (status !== "refunded" && status !== "rejected") {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    res.json(await refundRepo.decide(id, status, adminNote));
  } catch (err) {
    if (err instanceof refundRepo.RefundError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};