import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  customType,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";

// Para sa pag-save sa picture sa database
const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: serial().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  // Para sa refund: unsang online payment ug unsa ang number (GCash, Maya, etc.)
  paymentProvider: text("payment_provider"),
  paymentNumber: text("payment_number"),
  // Gi-accept sa user ang Terms ug Rules sa system
  acceptedTermsAt: timestamp("accepted_terms_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  category: text().notNull(),
  price: integer().notNull(),
  // Kung naay oldPrice, naka-sale ang product. Ang percent off kay gi-compute gikan sa oldPrice ug price
  oldPrice: integer("old_price"),
  // Kung naay sizes, ang stock kay ang sum sa tanang sizes
  stock: integer().notNull().default(0),
  description: text().notNull().default(""),
  image: text().notNull().default(""),
  featured: boolean().notNull().default(false),
  isNew: boolean("is_new").notNull().default(false),
});

// Mga size sa product (clothing ug shoes), naay kaugalingong stock ang matag size
export const productSizes = pgTable("product_sizes", {
  id: serial().primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  size: text().notNull(),
  stock: integer().notNull().default(0),
});

// Ang picture sa product naa sa lahi nga table, aron gaan ang product list
export const productImages = pgTable("product_images", {
  productId: integer("product_id")
    .primaryKey()
    .references(() => products.id, { onDelete: "cascade" }),
  contentType: text("content_type").notNull(),
  data: bytea("data").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: text().primaryKey(),
  // Walay user ang order kung admin ang nag-order
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  email: text().notNull(),
  phone: text().notNull(),
  address: text().notNull(),
  total: integer().notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull(),
  // pending | processing | shipped | completed | cancelled
  status: text().notNull().default("pending"),
  // Kung kanus-a gi-cancel (gamiton para sa 10 minutes rule)
  cancelledAt: timestamp("cancelled_at"),
  cancelReason: text("cancel_reason"),
  // none | requested | refunded | rejected
  refundStatus: text("refund_status").notNull().default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial().primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // Walay foreign key sa product, aron magpabilin ang order history bisan ma-delete ang product
  productId: integer("product_id").notNull(),
  name: text().notNull(),
  // Walay size ang beauty products
  size: text(),
  price: integer().notNull(),
  quantity: integer().notNull(),
});

// Refund request sa customer (pwede ra kung ni-cancel ubos sa 10 minutes)
export const refunds = pgTable("refunds", {
  id: serial().primaryKey(),
  orderId: text("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  amount: integer().notNull(),
  reason: text().notNull().default(""),
  // Snapshot sa payment details sa panahon sa request, para dali ma-trace
  paymentProvider: text("payment_provider"),
  paymentNumber: text("payment_number"),
  // requested | refunded | rejected
  status: text().notNull().default("requested"),
  adminNote: text("admin_note"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Wishlist: usa ka row kada user ug product. Ang composite key mopugong sa duplicate
export const wishlist = pgTable(
  "wishlist",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

// Rating ug review sa product. Usa ra ka review kada user kada product
export const reviews = pgTable(
  "reviews",
  {
    id: serial().primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // 1 hangtod 5
    rating: integer().notNull(),
    comment: text().notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.productId)],
);

// Report sa customer batok sa product. Makita sa admin
export const productReports = pgTable("product_reports", {
  id: serial().primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  reporterId: integer("reporter_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reason: text().notNull(),
  details: text().notNull().default(""),
  // open | reviewed | dismissed
  status: text().notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notification para sa user ug admin
export const notifications = pgTable("notifications", {
  id: serial().primaryKey(),
  // Kung null, para sa admin
  userId: integer("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  // user | admin
  audience: text().notNull().default("user"),
  title: text().notNull(),
  message: text().notNull().default(""),
  // Optional nga link kung asa moadto inig click (pananglitan /account/orders)
  link: text(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit logs: tala sa mga gihimo sa admin ug importante nga hitabo sa system
export const auditLogs = pgTable("audit_logs", {
  id: serial().primaryKey(),
  // admin | user | system
  actorType: text("actor_type").notNull().default("admin"),
  actorId: integer("actor_id"),
  actorName: text("actor_name").notNull().default(""),
  // Pananglitan: product.update, order.status, refund.approve
  action: text().notNull(),
  // Unsa ang naapektuhan: product, order, refund, etc.
  entity: text().notNull().default(""),
  entityId: text("entity_id"),
  details: text().notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Customer support: mensahe sa customer, ug reply sa admin
export const supportTickets = pgTable("support_tickets", {
  id: serial().primaryKey(),
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  subject: text().notNull(),
  message: text().notNull(),
  // open | answered | closed
  status: text().notNull().default("open"),
  adminReply: text("admin_reply"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  repliedAt: timestamp("replied_at"),
});