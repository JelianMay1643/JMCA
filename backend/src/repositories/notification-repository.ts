import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import type { AuthUser } from "@/middleware/auth";

// Admin: shared nga audience "admin". Customer: iyang kaugalingon ra
const scope = (auth: AuthUser) =>
  auth.role === "admin"
    ? eq(notifications.audience, "admin")
    : and(
        eq(notifications.audience, "user"),
        eq(notifications.userId, auth.userId ?? -1)
      );

export const list = async (auth: AuthUser) => {
  const items = await db
    .select()
    .from(notifications)
    .where(scope(auth))
    .orderBy(desc(notifications.createdAt))
    .limit(30);

  const [{ unread }] = await db
    .select({ unread: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(scope(auth), eq(notifications.isRead, false)));

  return { items, unread };
};

export const markRead = async (auth: AuthUser, id: number) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(scope(auth), eq(notifications.id, id)));
};

export const markAllRead = async (auth: AuthUser) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(scope(auth), eq(notifications.isRead, false)));
};