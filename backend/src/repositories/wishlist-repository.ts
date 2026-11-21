import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products, wishlist } from "@/db/schema";

export async function getWishlistIds(userId: number): Promise<number[]> {
  const rows = await db
    .select({ productId: wishlist.productId })
    .from(wishlist)
    .where(eq(wishlist.userId, userId));
  return rows.map((r) => r.productId);
}

export async function productExists(productId: number): Promise<boolean> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);
  return rows.length > 0;
}

export async function addToWishlist(userId: number, productId: number) {
  await db
    .insert(wishlist)
    .values({ userId, productId })
    .onConflictDoNothing();
}

export async function removeFromWishlist(userId: number, productId: number) {
  await db
    .delete(wishlist)
    .where(and(eq(wishlist.userId, userId), eq(wishlist.productId, productId)));
}