import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type Options = {
  page?: number;
  limit?: number;
  search?: string;
  entity?: string;
};

export const list = async ({
  page = 1,
  limit = 15,
  search = "",
  entity,
}: Options = {}) => {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 15, 1), 50);
  const safePage = Math.max(Math.floor(page) || 1, 1);

  const conditions: SQL[] = [];
  const q = search.trim().replace(/[%_\\]/g, "\\$&");
  if (q) {
    conditions.push(
      or(
        ilike(auditLogs.action, `%${q}%`),
        ilike(auditLogs.actorName, `%${q}%`),
        ilike(auditLogs.details, `%${q}%`),
        ilike(auditLogs.entityId, `%${q}%`)
      )!
    );
  }
  if (entity) conditions.push(eq(auditLogs.entity, entity));
  const where = conditions.length ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(where)
      .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
      .limit(safeLimit)
      .offset((safePage - 1) * safeLimit),
    db.select({ total: count() }).from(auditLogs).where(where),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};