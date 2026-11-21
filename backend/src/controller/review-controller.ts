import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import * as reviewRepo from "@/repositories/review-repository";
import * as productRepo from "@/repositories/product-repository";

const userId = (res: Response) => (res.locals.auth as AuthUser).userId as number;

const productId = (req: Request) => {
  const id = Number(req.params.productId);
  return Number.isInteger(id) && id > 0 ? id : null;
};

export const list = async (req: Request, res: Response) => {
  const pid = productId(req);
  if (!pid) return res.status(404).json({ message: "Product not found" });
  res.json(await reviewRepo.getByProduct(pid));
};

export const mine = async (req: Request, res: Response) => {
  const pid = productId(req);
  if (!pid) return res.status(404).json({ message: "Product not found" });
  const uid = userId(res);
  res.json({
    canReview: await reviewRepo.hasPurchased(uid, pid),
    myReview: await reviewRepo.getMine(uid, pid),
  });
};

export const save = async (req: Request, res: Response) => {
  const pid = productId(req);
  if (!pid || !(await productRepo.getById(pid))) {
    return res.status(404).json({ message: "Product not found" });
  }
  const rating = Number(req.body.rating);
  const comment = String(req.body.comment ?? "").trim().slice(0, 500);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be 1 to 5" });
  }
  const uid = userId(res);
  if (!(await reviewRepo.hasPurchased(uid, pid))) {
    return res
      .status(403)
      .json({ message: "You can only rate products from your completed orders" });
  }
  await reviewRepo.upsert(uid, pid, rating, comment);
  res.status(201).json({ ok: true });
};