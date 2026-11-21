import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, notifications, orders, refunds, users } from "@/db/schema";

export class RefundError extends Error {}

const WINDOW_MS = 10 * 60 * 1000;

// Customer: mag-request og refund sa cancelled nga order nga bayad na
export const request = async (
  userId: number,
  orderId: string,
  reason: string
) => {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
      .limit(1);

    if (!order) throw new RefundError("Order not found");
    if (order.status !== "cancelled") {
      throw new RefundError("Only cancelled orders can be refunded");
    }
    if (order.paymentStatus !== "paid") {
      throw new RefundError("This order has no online payment to refund");
    }
    if (order.refundStatus !== "none") {
      throw new RefundError("A refund was already requested for this order");
    }

    // Eligible ra kung na-cancel ubos sa 10 minutes gikan sa pag-order
    const cancelledInTime =
      order.cancelledAt !== null &&
      order.cancelledAt.getTime() - order.createdAt.getTime() <=
        WINDOW_MS + 1000;
    if (!cancelledInTime) {
      throw new RefundError(
        "Refund is only available for orders cancelled within 10 minutes"
      );
    }

    const [user] = await tx
      .select({
        paymentProvider: users.paymentProvider,
        paymentNumber: users.paymentNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user?.paymentProvider || !user?.paymentNumber) {
      throw new RefundError(
        "Please add your GCash or online payment number in your Profile first"
      );
    }

    const [created] = await tx
      .insert(refunds)
      .values({
        orderId,
        userId,
        amount: order.total,
        reason,
        paymentProvider: user.paymentProvider,
        paymentNumber: user.paymentNumber,
      })
      .returning();

    await tx
      .update(orders)
      .set({ refundStatus: "requested" })
      .where(eq(orders.id, orderId));

    // Notification para sa admin
    await tx.insert(notifications).values({
      userId: null,
      audience: "admin",
      title: "New refund request",
      message: `Order ${orderId} (${order.customerName})`,
      link: "/admin/refunds",
    });

    return created;
  });
};

// Admin: tanang refund requests ug na-refund na
export const listAll = () =>
  db
    .select({
      id: refunds.id,
      orderId: refunds.orderId,
      amount: refunds.amount,
      reason: refunds.reason,
      paymentProvider: refunds.paymentProvider,
      paymentNumber: refunds.paymentNumber,
      status: refunds.status,
      adminNote: refunds.adminNote,
      requestedAt: refunds.requestedAt,
      processedAt: refunds.processedAt,
      customerName: orders.customerName,
      email: orders.email,
    })
    .from(refunds)
    .innerJoin(orders, eq(refunds.orderId, orders.id))
    .orderBy(desc(refunds.requestedAt));

// Admin: i-refund o i-reject
export const decide = async (
  id: number,
  status: "refunded" | "rejected",
  adminNote: string
) => {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(refunds)
      .set({ status, adminNote: adminNote || null, processedAt: new Date() })
      .where(and(eq(refunds.id, id), eq(refunds.status, "requested")))
      .returning();

    if (!updated) {
      throw new RefundError("Refund not found or already processed");
    }

    await tx
      .update(orders)
      .set({ refundStatus: status })
      .where(eq(orders.id, updated.orderId));

    // Audit log
    await tx.insert(auditLogs).values({
      actorType: "admin",
      actorName: "Admin",
      action: status === "refunded" ? "refund.approve" : "refund.reject",
      entity: "refund",
      entityId: String(updated.id),
      details: `Order ${updated.orderId}, amount ${updated.amount}`,
    });

    // Notification para sa customer
    if (updated.userId) {
      await tx.insert(notifications).values({
        userId: updated.userId,
        audience: "user",
        title: status === "refunded" ? "Refund sent" : "Refund rejected",
        message:
          status === "refunded"
            ? `Gi-refund na ang imong order ${updated.orderId}.`
            : `Gi-reject ang refund sa order ${updated.orderId}.`,
        link: "/account/orders",
      });
    }

    return updated;
  });
};