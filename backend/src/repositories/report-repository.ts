import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLogs,
  notifications,
  productReports,
  products,
  users,
} from "@/db/schema";

export class ReportError extends Error {}

export const reasons = [
  "Fake or counterfeit",
  "Wrong description or price",
  "Inappropriate item",
  "Damaged or poor quality",
  "Other",
];

// Customer: i-report ang product
export const create = async (
  reporterId: number,
  productId: number,
  reason: string,
  details: string
) => {
  return db.transaction(async (tx) => {
    const [product] = await tx
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) throw new ReportError("Product not found");

    // Dili pwede doble nga open report sa parehas nga user ug product
    const [existing] = await tx
      .select({ id: productReports.id })
      .from(productReports)
      .where(
        and(
          eq(productReports.productId, productId),
          eq(productReports.reporterId, reporterId),
          eq(productReports.status, "open")
        )
      )
      .limit(1);
    if (existing) {
      throw new ReportError("You already reported this product");
    }

    const [created] = await tx
      .insert(productReports)
      .values({ productId, reporterId, reason, details })
      .returning();

    await tx.insert(notifications).values({
      userId: null,
      audience: "admin",
      title: "New product report",
      message: `${product.name}: ${reason}`,
      link: "/admin/reports",
    });

    return created;
  });
};

// Admin: tanang reports
export const listAll = () =>
  db
    .select({
      id: productReports.id,
      productId: productReports.productId,
      productName: products.name,
      reason: productReports.reason,
      details: productReports.details,
      status: productReports.status,
      createdAt: productReports.createdAt,
      reporterName: users.name,
      reporterEmail: users.email,
    })
    .from(productReports)
    .innerJoin(products, eq(productReports.productId, products.id))
    .leftJoin(users, eq(productReports.reporterId, users.id))
    .orderBy(desc(productReports.createdAt));

// Admin: i-mark nga reviewed o dismissed
export const setStatus = async (id: number, status: "reviewed" | "dismissed") => {
  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(productReports)
      .set({ status })
      .where(eq(productReports.id, id))
      .returning();
    if (!updated) throw new ReportError("Report not found");

    await tx.insert(auditLogs).values({
      actorType: "admin",
      actorName: "Admin",
      action: `report.${status}`,
      entity: "report",
      entityId: String(id),
      details: `Product ${updated.productId}`,
    });

    return updated;
  });
};