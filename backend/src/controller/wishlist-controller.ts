import type { Request, Response } from "express";
import type { AuthUser } from "@/middleware/auth";
import {
  addToWishlist,
  getWishlistIds,
  productExists,
  removeFromWishlist,
} from "@/repositories/wishlist-repository";

const currentUserId = (res: Response) =>
  (res.locals.auth as AuthUser).userId as number;

function parseProductId(req: Request): number | null {
  const id = Number(req.params.productId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function list(_req: Request, res: Response) {
  const productIds = await getWishlistIds(currentUserId(res));
  res.json({ productIds });
}

export async function add(req: Request, res: Response) {
  const productId = parseProductId(req);
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  if (!(await productExists(productId))) {
    return res.status(404).json({ message: "Product not found" });
  }
  await addToWishlist(currentUserId(res), productId);
  res.status(201).json({ ok: true });
}

export async function remove(req: Request, res: Response) {
  const productId = parseProductId(req);
  if (!productId) {
    return res.status(400).json({ message: "Invalid product id" });
  }
  await removeFromWishlist(currentUserId(res), productId);
  res.json({ ok: true });
}