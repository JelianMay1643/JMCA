import { inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { productSizes, products } from "@/db/schema";

// Default nga sizes para sa mga products nga naa na
const defaults: Record<string, string[]> = {
  clothing: ["S", "M", "L", "XL"],
  shoes: ["36", "37", "38", "39", "40"],
};

async function run() {
  const rows = await db
    .select()
    .from(products)
    .where(inArray(products.category, Object.keys(defaults)));

  const existing = await db
    .select({ productId: productSizes.productId })
    .from(productSizes);
  const hasSizes = new Set(existing.map((e) => e.productId));

  let count = 0;
  for (const p of rows) {
    if (hasSizes.has(p.id)) continue; // naa na'y sizes

    const sizes = defaults[p.category];
    // Bahinon ang karon nga stock sa tanang sizes
    const base = Math.floor(p.stock / sizes.length);
    const extra = p.stock % sizes.length;

    await db.insert(productSizes).values(
      sizes.map((size, i) => ({
        productId: p.id,
        size,
        stock: base + (i < extra ? 1 : 0),
      }))
    );
    count++;
  }

  console.log(`Added sizes to ${count} products.`);
}

run()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());