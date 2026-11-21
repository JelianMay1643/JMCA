import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as orderRepo from "@/repositories/order-repository";

export const cancelMyOrder = async (req: Request, res: Response) => {
  const userId = (res.locals.auth as AuthUser).userId as number;
  const id = String(req.params.id);
  const reason = String(req.body?.reason ?? "").trim().slice(0, 200);

  try {
    const order = await orderRepo.cancelForUser(id, userId, reason);
    res.json(order);
  } catch (err) {
    if (err instanceof orderRepo.OrderError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};