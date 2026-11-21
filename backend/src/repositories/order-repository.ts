import { randomBytes } from "crypto";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  notifications,
  orderItems,
  orders,
  productSizes,
  products,
} from "@/db/schema";

export class OrderError extends Error {}

const LOW_STOCK = 5;

type CreateOrderInput = {
  userId: number | null;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid";
  items: { productId: number; size: string | null; quantity: number }[];
};

type Line = {
  productId: number;
  name: string;
  size: string | null;
  price: number;
  quantity: number;
};

// Idugang ang items sa matag order
const attachItems = async (rows: (typeof orders.$inferSelect)[]) => {
  if (rows.length === 0) return [];

  const items = await db
    .select()
    .from(orderItems)
    .where(
      inArray(
        orderItems.orderId,
        rows.map((o) => o.id)
      )
    );

  return rows.map((o) => ({
    ...o,
    items: items
      .filter((i) => i.orderId === o.id)
      .map(({ productId, name, size, price, quantity }) => ({
        productId,
        name,
        size,
        price,
        quantity,
      })),
  }));
};

export const create = async (input: CreateOrderInput) => {
  const { items, ...details } = input;

  // Transaction: kung naay mapakyas, ma-undo ang tanan (pati ang stock)
  return db.transaction(async (tx) => {
    const lines: Line[] = [];
    const lowStock: string[] = [];

    for (const item of items) {
      const [existing] = await tx
        .select()
        .from(products)
        .where(eq(products.id, item.productId))
        .limit(1);
      if (!existing) throw new OrderError("Product not found");

      // Naay sizes ba kini nga product?
      const sizeRows = await tx
        .select({ size: productSizes.size })
        .from(productSizes)
        .where(eq(productSizes.productId, item.productId));
      const hasSizes = sizeRows.length > 0;

      if (hasSizes) {
        if (!item.size || !sizeRows.some((r) => r.size === item.size)) {
          throw new OrderError(`Please choose a size for ${existing.name}`);
        }

        // I-reduce ang stock sa size kung igo pa lang
        const [sizeUpdated] = await tx
          .update(productSizes)
          .set({ stock: sql`${productSizes.stock} - ${item.quantity}` })
          .where(
            and(
              eq(productSizes.productId, item.productId),
              eq(productSizes.size, item.size),
              gte(productSizes.stock, item.quantity)
            )
          )
          .returning({ id: productSizes.id, stock: productSizes.stock });
        if (!sizeUpdated) {
          throw new OrderError(
            `Not enough stock for ${existing.name} (size ${item.size})`
          );
        }
        if (sizeUpdated.stock <= LOW_STOCK) {
          lowStock.push(
            `${existing.name} (${item.size}): ${sizeUpdated.stock} left`
          );
        }
      }

      // I-reduce pud ang total stock sa product (dili ma-oversell)
      const [updated] = await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.quantity}` })
        .where(
          and(
            eq(products.id, item.productId),
            gte(products.stock, item.quantity)
          )
        )
        .returning({ id: products.id, stock: products.stock });
      if (!updated) {
        throw new OrderError(`Not enough stock for ${existing.name}`);
      }
      if (!hasSizes && updated.stock <= LOW_STOCK) {
        lowStock.push(`${existing.name}: ${updated.stock} left`);
      }

      // Ang presyo kuhaon gikan sa database, dili gikan sa frontend
      lines.push({
        productId: existing.id,
        name: existing.name,
        size: hasSizes ? item.size : null,
        price: existing.price,
        quantity: item.quantity,
      });
    }

    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
    const id = `JMCA-${randomBytes(3).toString("hex").toUpperCase()}`;

    const [order] = await tx
      .insert(orders)
      .values({ id, ...details, total })
      .returning();

    await tx
      .insert(orderItems)
      .values(lines.map((l) => ({ ...l, orderId: id })));

    // Notification para sa admin: bag-ong order
    await tx.insert(notifications).values({
      userId: null,
      audience: "admin",
      title: "New order",
      message: `${id} from ${details.customerName}, total ${total}`,
      link: "/admin/orders",
    });

    // Low stock alerts
    if (lowStock.length > 0) {
      await tx.insert(notifications).values(
        lowStock.map((text) => ({
          userId: null,
          audience: "admin",
          title: "Low stock",
          message: text,
          link: "/admin/products",
        }))
      );
    }

    return { ...order, items: lines };
  });
};

// Admin: tanang orders
export const getAll = async () => {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  return attachItems(rows);
};

// Customer: ang iyang orders ra
export const getByUser = async (userId: number) => {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));
  return attachItems(rows);
};

export const updateStatus = async (id: string, status: string) => {
  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    if (!row) return undefined;

    await tx.insert(auditLogs).values({
      actorType: "admin",
      actorName: "Admin",
      action: "order.status",
      entity: "order",
      entityId: id,
      details: `Order ${id} set to ${status}`,
    });

    // Notification para sa customer
    if (row.userId) {
      await tx.insert(notifications).values({
        userId: row.userId,
        audience: "user",
        title: "Order update",
        message: `Your order ${id} is now ${status}.`,
        link: "/account/orders",
      });
    }

    return row;
  });

  if (!updated) return undefined;
  const [full] = await attachItems([updated]);
  return full;
};

// Customer: i-cancel ang iyang order. Pwede ra kung pending pa ug ubos sa 10 minutes
// gikan sa pag-order. Ibalik ang stock inig cancel.
export const cancelForUser = async (
  id: string,
  userId: number,
  reason = ""
) => {
  return db.transaction(async (tx) => {
    // Ang oras gi-check sa database (now()) aron dili madaot sa clock sa computer
    const [updated] = await tx
      .update(orders)
      .set({
        status: "cancelled",
        cancelledAt: sql`now()`,
        cancelReason: reason || null,
      })
      .where(
        and(
          eq(orders.id, id),
          eq(orders.userId, userId),
          eq(orders.status, "pending"),
          gte(orders.createdAt, sql`now() - interval '10 minutes'`)
        )
      )
      .returning();

    if (!updated) {
      // Tan-awon kung nganong napakyas, para klaro ang message
      const [existing] = await tx
        .select({ status: orders.status })
        .from(orders)
        .where(and(eq(orders.id, id), eq(orders.userId, userId)))
        .limit(1);

      if (!existing) throw new OrderError("Order not found");
      if (existing.status !== "pending") {
        throw new OrderError("Only pending orders can be cancelled");
      }
      throw new OrderError(
        "You can no longer cancel this order. Cancellation is only allowed within 10 minutes after placing it."
      );
    }

    const items = await tx
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    for (const item of items) {
      if (item.size) {
        const [restored] = await tx
          .update(productSizes)
          .set({ stock: sql`${productSizes.stock} + ${item.quantity}` })
          .where(
            and(
              eq(productSizes.productId, item.productId),
              eq(productSizes.size, item.size)
            )
          )
          .returning({ id: productSizes.id });

        // Kung wala na ang size (gi-delete sa admin), skip
        if (!restored) continue;
      }

      await tx
        .update(products)
        .set({ stock: sql`${products.stock} + ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    // Notification para sa admin
    await tx.insert(notifications).values({
      userId: null,
      audience: "admin",
      title: "Order cancelled",
      message: `${id} (${updated.customerName}) was cancelled by the customer`,
      link: "/admin/orders",
    });

    return {
      ...updated,
      items: items.map(({ productId, name, size, price, quantity }) => ({
        productId,
        name,
        size,
        price,
        quantity,
      })),
    };
  });
};