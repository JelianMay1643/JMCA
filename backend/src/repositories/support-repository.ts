import { and, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, notifications, supportTickets, users } from "@/db/schema";

export class SupportError extends Error {}

const MAX_OPEN = 5;

// Customer: mag-send ug ticket
export const create = async (
  userId: number,
  subject: string,
  message: string
) => {
  return db.transaction(async (tx) => {
    // Pugngan ang spam: hangtod 5 ka open nga ticket kada customer
    const [{ open }] = await tx
      .select({ open: count() })
      .from(supportTickets)
      .where(
        and(
          eq(supportTickets.userId, userId),
          eq(supportTickets.status, "open")
        )
      );
    if (open >= MAX_OPEN) {
      throw new SupportError(
        "You have too many open tickets. Please wait for a reply first."
      );
    }

    const [created] = await tx
      .insert(supportTickets)
      .values({ userId, subject, message })
      .returning();

    // Notification para sa admin
    await tx.insert(notifications).values({
      userId: null,
      audience: "admin",
      title: "New support ticket",
      message: subject,
      link: "/admin/support",
    });

    return created;
  });
};

// Customer: akong tickets
export const listMine = (userId: number) =>
  db
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.userId, userId))
    .orderBy(desc(supportTickets.createdAt));

// Admin: tanang tickets
export const listAll = () =>
  db
    .select({
      id: supportTickets.id,
      subject: supportTickets.subject,
      message: supportTickets.message,
      status: supportTickets.status,
      adminReply: supportTickets.adminReply,
      createdAt: supportTickets.createdAt,
      repliedAt: supportTickets.repliedAt,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(supportTickets)
    .leftJoin(users, eq(supportTickets.userId, users.id))
    .orderBy(desc(supportTickets.createdAt));

// Admin: reply sa ticket
export const reply = async (id: number, text: string) => {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(supportTickets)
      .set({ adminReply: text, status: "answered", repliedAt: new Date() })
      .where(
        and(eq(supportTickets.id, id), ne(supportTickets.status, "closed"))
      )
      .returning();
    if (!updated) {
      throw new SupportError("Ticket not found or already closed");
    }

    await tx.insert(auditLogs).values({
      actorType: "admin",
      actorName: "Admin",
      action: "support.reply",
      entity: "support",
      entityId: String(id),
      details: `Replied to "${updated.subject}"`,
    });

    // Notification para sa customer
    if (updated.userId) {
      await tx.insert(notifications).values({
        userId: updated.userId,
        audience: "user",
        title: "Support replied",
        message: `Naay reply sa imong ticket: ${updated.subject}`,
        link: "/account/support",
      });
    }

    return updated;
  });
};

// Admin: i-close ang ticket
export const close = async (id: number) => {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(supportTickets)
      .set({ status: "closed" })
      .where(eq(supportTickets.id, id))
      .returning();
    if (!updated) throw new SupportError("Ticket not found");

    await tx.insert(auditLogs).values({
      actorType: "admin",
      actorName: "Admin",
      action: "support.close",
      entity: "support",
      entityId: String(id),
      details: `Closed "${updated.subject}"`,
    });

    return updated;
  });
};