import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as paymentRepo from "@/repositories/payment-repository";

const providers = ["GCash", "Maya", "GoTyme", "Bank", "Other"];
const userId = (res: Response) => (res.locals.auth as AuthUser).userId as number;

export const get = async (_req: Request, res: Response) => {
  res.json(await paymentRepo.getPayment(userId(res)));
};

export const save = async (req: Request, res: Response) => {
  const provider = String(req.body.paymentProvider ?? "").trim();
  const number = String(req.body.paymentNumber ?? "").replace(/\s+/g, "");

  // Walay sulod = tangtangon ang payment details
  if (!provider && !number) {
    await paymentRepo.savePayment(userId(res), null, null);
    return res.json({ paymentProvider: null, paymentNumber: null });
  }
  if (!providers.includes(provider)) {
    return res.status(400).json({ message: "Choose a valid payment provider" });
  }
  if (!/^[0-9]{7,16}$/.test(number)) {
    return res
      .status(400)
      .json({ message: "Payment number must be 7 to 16 digits" });
  }
  await paymentRepo.savePayment(userId(res), provider, number);
  res.json({ paymentProvider: provider, paymentNumber: number });
};