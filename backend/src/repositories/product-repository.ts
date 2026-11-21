import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import { productImages, productSizes, products, reviews } from "@/db/schema";

export type ProductInput = Omit<typeof products.$inferInsert, "id">;
export type SizeInput = { size: string; stock: number };

export type ProductFilters = {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  tag?: string; // "new" o "sale"
  sort?: string; // "price-asc" o "price-desc"
};

type ProductRow = typeof products.$inferSelect;

// Idugang ang sizes ug rating sa matag product
const attachSizes = async (rows: ProductRow[]) => {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);

  const sizes = await db
    .select()
    .from(productSizes)
    .where(inArray(productSizes.productId, ids))
    .orderBy(asc(productSizes.id));

  const ratings = await db
    .select({
      productId: reviews.productId,
      avgRating: sql<string>`avg(${reviews.rating})`,
      reviewCount: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(inArray(reviews.productId, ids))
    .groupBy(reviews.productId);

  return rows.map((r) => {
    const rating = ratings.find((x) => x.productId === r.id);
    return {
      ...r,
      sizes: sizes
        .filter((s) => s.productId === r.id)
        .map(({ size, stock }) => ({ size, stock })),
      avgRating: rating ? Math.round(Number(rating.avgRating) * 10) / 10 : 0,
      reviewCount: rating?.reviewCount ?? 0,
    };
  });
};

const totalStock = (sizes: SizeInput[], fallback: number) =>
  sizes.length > 0 ? sizes.reduce((sum, s) => sum + s.stock, 0) : fallback;

export const getAll = async (filters: ProductFilters = {}) => {
  const conditions: SQL[] = [];

  if (filters.category) {
    conditions.push(eq(products.category, filters.category));
  }
  if (filters.search) {
    const s = `%${filters.search}%`;
    conditions.push(
      or(ilike(products.name, s), ilike(products.description, s))!
    );
  }
  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice));
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice));
  }
  if (filters.featured) {
    conditions.push(eq(products.featured, true));
  }
  if (filters.tag === "new") {
    conditions.push(eq(products.isNew, true));
  }
  if (filters.tag === "sale") {
    conditions.push(isNotNull(products.oldPrice));
  }

  const order =
    filters.sort === "price-asc"
      ? asc(products.price)
      : filters.sort === "price-desc"
        ? desc(products.price)
        : asc(products.id);

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(order);

  return attachSizes(rows);
};

export const getById = async (id: number) => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!product) return undefined;

  const [full] = await attachSizes([product]);
  return full;
};

export const add = async (data: ProductInput, sizes: SizeInput[]) => {
  return db.transaction(async (tx) => {
    const stock = totalStock(sizes, data.stock ?? 0);

    const [created] = await tx
      .insert(products)
      .values({ ...data, stock })
      .returning();

    if (sizes.length > 0) {
      await tx.insert(productSizes).values(
        sizes.map((s) => ({
          productId: created.id,
          size: s.size,
          stock: s.stock,
        }))
      );
    }

    return { ...created, sizes };
  });
};

export const update = async (
  id: number,
  data: ProductInput,
  sizes: SizeInput[]
) => {
  return db.transaction(async (tx) => {
    const stock = totalStock(sizes, data.stock ?? 0);

    const [updated] = await tx
      .update(products)
      .set({ ...data, stock })
      .where(eq(products.id, id))
      .returning();
    if (!updated) return undefined;

    // Ilisan ang tanang sizes sa gi-submit nga listahan
    await tx.delete(productSizes).where(eq(productSizes.productId, id));
    if (sizes.length > 0) {
      await tx.insert(productSizes).values(
        sizes.map((s) => ({
          productId: id,
          size: s.size,
          stock: s.stock,
        }))
      );
    }

    return { ...updated, sizes };
  });
};

export const remove = async (id: number) => {
  const deleted = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return deleted.length > 0;
};

// --- Picture sa product ---

export const getImage = async (id: number) => {
  const [image] = await db
    .select({
      contentType: productImages.contentType,
      data: productImages.data,
    })
    .from(productImages)
    .where(eq(productImages.productId, id))
    .limit(1);
  return image;
};

// I-save o i-ilis ang picture, ug i-update ang image link sa product
export const setImage = async (
  id: number,
  data: Buffer,
  contentType: string
) => {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    if (!existing) return undefined;

    await tx
      .insert(productImages)
      .values({ productId: id, contentType, data })
      .onConflictDoUpdate({
        target: productImages.productId,
        set: { contentType, data, updatedAt: new Date() },
      });

    // Ang ?v= kay aron mo-refresh ang picture sa browser kung ilisan
    const [updated] = await tx
      .update(products)
      .set({ image: `/api/products/${id}/image?v=${Date.now()}` })
      .where(eq(products.id, id))
      .returning();
    return updated;
  });
};

export const removeImage = async (id: number) => {
  return db.transaction(async (tx) => {
    await tx.delete(productImages).where(eq(productImages.productId, id));
    const [updated] = await tx
      .update(products)
      .set({ image: "" })
      .where(eq(products.id, id))
      .returning();
    return updated;
  });
};

export type PageOptions = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
};

export const getPage = async ({
  page = 1,
  limit = 15,
  search = "",
  category,
}: PageOptions = {}) => {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 15, 1), 50);
  const safePage = Math.max(Math.floor(page) || 1, 1);

  const conditions: SQL[] = [];
  const q = search.trim().replace(/[%_\\]/g, "\\$&");
  if (q) {
    conditions.push(
      or(ilike(products.name, `%${q}%`), ilike(products.category, `%${q}%`))!
    );
  }
  if (category) conditions.push(eq(products.category, category));
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(desc(products.id))
      .limit(safeLimit)
      .offset((safePage - 1) * safeLimit),
    db.select({ total: count() }).from(products).where(where),
  ]);

  return {
    items: await attachSizes(rows),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.max(1, Math.ceil(total / safeLimit)),
  };
};