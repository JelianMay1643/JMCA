import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, reviews, users } from "@/db/schema";

export const getByProduct = (productId: number) =>
  db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      userName: users.name,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));

export const getMine = async (userId: number, productId: number) => {
  const [row] = await db
    .select({ rating: reviews.rating, comment: reviews.comment })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1);
  return row ?? null;
};

// Pwede ra mo-review kung na-deliver na ang order nga naay kana nga product
export const hasPurchased = async (userId: number, productId: number) => {
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.status, "delivered"),
        eq(orderItems.productId, productId)
      )
    )
    .limit(1);
  return rows.length > 0;
};

export const upsert = async (
  userId: number,
  productId: number,
  rating: number,
  comment: string
) => {
  await db
    .insert(reviews)
    .values({ userId, productId, rating, comment })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.productId],
      set: { rating, comment, createdAt: new Date() },
    });
};