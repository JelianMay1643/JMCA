import { db, pool } from "@/db";
import { products } from "@/db/schema";

const items: (typeof products.$inferInsert)[] = [
  { name: "Floral Summer Dress", category: "clothing", price: 850, oldPrice: 1100, stock: 15, description: "Light and breezy dress for hot days.", featured: true, isNew: true },
  { name: "Oversized Blazer", category: "clothing", price: 1200, stock: 10, description: "Relaxed fit blazer for work or casual.", isNew: true },
  { name: "High-Waist Jeans", category: "clothing", price: 790, stock: 25, description: "Comfortable stretch denim." },
  { name: "Basic Cotton Tee", category: "clothing", price: 299, oldPrice: 399, stock: 40, description: "Soft everyday t-shirt." },
  { name: "Pleated Midi Skirt", category: "clothing", price: 650, stock: 18, description: "Flowy skirt that goes with anything.", isNew: true },
  { name: "Knit Cardigan", category: "clothing", price: 720, oldPrice: 900, stock: 12, description: "Warm and soft knit layer." },

  { name: "Rose Lip Tint", category: "beauty", price: 199, stock: 50, description: "Natural looking color for your lips.", isNew: true },
  { name: "Hydrating Face Serum", category: "beauty", price: 450, oldPrice: 550, stock: 30, description: "Lightweight serum for glowing skin.", featured: true },
  { name: "Matte Foundation", category: "beauty", price: 380, stock: 22, description: "Long-lasting matte finish." },
  { name: "Eyeshadow Palette", category: "beauty", price: 520, stock: 16, description: "12 shades from nude to bold.", isNew: true },
  { name: "Vitamin C Moisturizer", category: "beauty", price: 410, oldPrice: 480, stock: 28, description: "Daily moisturizer for bright skin." },
  { name: "Setting Spray", category: "beauty", price: 260, stock: 35, description: "Keeps your makeup in place all day." },

  { name: "Classic White Sneakers", category: "shoes", price: 1100, stock: 20, description: "Clean and simple sneakers." },
  { name: "Strappy Block Heels", category: "shoes", price: 950, oldPrice: 1200, stock: 14, description: "Comfortable heels for any event.", featured: true, isNew: true },
  { name: "Ballet Flats", category: "shoes", price: 580, stock: 26, description: "Soft flats for everyday wear." },
  { name: "Platform Sandals", category: "shoes", price: 690, oldPrice: 850, stock: 17, description: "Trendy sandals with extra height.", isNew: true },
  { name: "Ankle Boots", category: "shoes", price: 1350, stock: 9, description: "Stylish boots with a low heel." },
  { name: "Casual Slides", category: "shoes", price: 350, oldPrice: 450, stock: 45, description: "Easy to wear at home or outside." },
];

async function seed() {
  const existing = await db.select({ id: products.id }).from(products).limit(1);
  if (existing.length > 0) {
    console.log("Products already exist. Skipping seed.");
    return;
  }
  await db.insert(products).values(items);
  console.log(`Added ${items.length} products.`);
}

seed()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());