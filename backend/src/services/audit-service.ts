import { db } from "../db";
import { auditLogs } from "../db/schema";

type Entry = {
  actorType?: "admin" | "user" | "system";
  actorId?: number | null;
  actorName?: string;
  action: string; // e.g. product.update, order.status, refund.approve
  entity?: string;
  entityId?: string | number;
  details?: string;
};

export async function logAudit(e: Entry) {
  try {
    await db.insert(auditLogs).values({
      actorType: e.actorType ?? "admin",
      actorId: e.actorId ?? null,
      actorName: e.actorName ?? "",
      action: e.action,
      entity: e.entity ?? "",
      entityId: e.entityId?.toString(),
      details: e.details ?? "",
    });
  } catch (err) {
    console.error("Audit log failed:", err); // dili i-break ang main request
  }
}