import { and, desc, eq, gte, lte, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, products, users } from "@/db/schema";

const LOW_STOCK = 5;
const DAY = 24 * 60 * 60 * 1000;
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// Petsa sa Pilipinas (YYYY-MM-DD)
const manilaDate = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(d);

export const getStats = async (days: number) => {
  // Sugod sa unang adlaw (12:00 AM sa Pilipinas)
  const todayStart = new Date(`${manilaDate(new Date())}T00:00:00+08:00`);
  const since = new Date(todayStart.getTime() - (days - 1) * DAY);

  // Ang cancelled nga orders dili ihapon sa sales
  const counted = ne(orders.status, "cancelled");
  const lineTotal = sql`${orderItems.price} * ${orderItems.quantity}`;
  const dayExpr = sql<string>`to_char((${orders.createdAt} AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Manila', 'YYYY-MM-DD')`;
  const categoryExpr = sql<string>`coalesce(${products.category}, 'other')`;

  const [
    [totals],
    statusRows,
    [customerRow],
    [productRow],
    dailyRows,
    topProducts,
    byCategory,
    byPayment,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    db
      .select({
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
        orders: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(counted),

    db
      .select({ status: orders.status, count: sql<number>`count(*)::int` })
      .from(orders)
      .groupBy(orders.status),

    db.select({ count: sql<number>`count(*)::int` }).from(users),

    db
      .select({
        total: sql<number>`count(*)::int`,
        low: sql<number>`(count(*) filter (where ${products.stock} <= ${sql.raw(String(LOW_STOCK))}))::int`,
      })
      .from(products),

    db
      .select({
        day: dayExpr,
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
        orders: sql<number>`count(*)::int`,
      })
      .from(orders)
      .where(and(counted, gte(orders.createdAt, since)))
      .groupBy(dayExpr)
      .orderBy(dayExpr),

    db
      .select({
        productId: orderItems.productId,
        name: orderItems.name,
        quantity: sql<number>`sum(${orderItems.quantity})::int`,
        revenue: sql<number>`sum(${lineTotal})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(counted)
      .groupBy(orderItems.productId, orderItems.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(5),

    db
      .select({
        category: categoryExpr,
        revenue: sql<number>`sum(${lineTotal})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(counted)
      .groupBy(categoryExpr)
      .orderBy(desc(sql`sum(${lineTotal})`)),

    db
      .select({
        method: orders.paymentMethod,
        count: sql<number>`count(*)::int`,
        revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      })
      .from(orders)
      .where(counted)
      .groupBy(orders.paymentMethod),

    db
      .select({
        id: orders.id,
        customerName: orders.customerName,
        total: orders.total,
        status: orders.status,
        paymentMethod: orders.paymentMethod,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5),

    db
      .select({
        id: products.id,
        name: products.name,
        category: products.category,
        stock: products.stock,
      })
      .from(products)
      .where(lte(products.stock, LOW_STOCK))
      .orderBy(products.stock)
      .limit(5),
  ]);

  // Ibutang ang 0 sa mga adlaw nga walay sales
  const dailyMap = new Map(dailyRows.map((r) => [r.day, r]));
  const daily = Array.from({ length: days }, (_, i) => {
    const date = manilaDate(
      new Date(since.getTime() + i * DAY + 12 * 60 * 60 * 1000)
    );
    const row = dailyMap.get(date);
    return { date, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  const statusCounts: Record<string, number> = {};
  for (const s of STATUSES) statusCounts[s] = 0;
  for (const row of statusRows) statusCounts[row.status] = row.count;

  const today = daily[daily.length - 1];

  return {
    totals: {
      revenue: totals.revenue,
      orders: totals.orders,
      customers: customerRow.count,
      products: productRow.total,
      lowStock: productRow.low,
    },
    period: {
      days,
      revenue: daily.reduce((sum, d) => sum + d.revenue, 0),
      orders: daily.reduce((sum, d) => sum + d.orders, 0),
    },
    today: { revenue: today.revenue, orders: today.orders },
    statusCounts,
    daily,
    topProducts,
    byCategory,
    byPayment,
    recentOrders,
    lowStock,
  };
};