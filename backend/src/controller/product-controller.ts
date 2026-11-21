import { Request, Response } from "express";
import * as productRepo from "@/repositories/product-repository";
import { logAudit } from "@/services/audit-service";

const categories = ["clothing", "beauty", "shoes"];
// Mga category nga naay sizes
const sizedCategories = ["clothing", "shoes"];

const toText = (value: unknown) =>
  typeof value === "string" && value !== "" ? value : undefined;

const toNumber = (value: unknown) =>
  value !== undefined && value !== "" && !isNaN(Number(value))
    ? Number(value)
    : undefined;

const parseId = (value: unknown) => {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
};

// Kuhaon ang product data gikan sa request body
const readProduct = (body: any) => ({
  name: String(body.name ?? "").trim(),
  category: String(body.category ?? ""),
  price: Number(body.price),
  oldPrice: body.oldPrice ? Number(body.oldPrice) : null,
  stock: Number(body.stock ?? 0),
  description: String(body.description ?? ""),
  image: String(body.image ?? ""),
  featured: Boolean(body.featured),
  isNew: Boolean(body.isNew),
});

const readSizes = (body: any): productRepo.SizeInput[] =>
  Array.isArray(body.sizes)
    ? body.sizes.map((s: any) => ({
        size: String(s?.size ?? "").trim(),
        stock: Number(s?.stock),
      }))
    : [];

const isValid = (p: ReturnType<typeof readProduct>) =>
  p.name !== "" &&
  categories.includes(p.category) &&
  Number.isInteger(p.price) &&
  p.price > 0 &&
  Number.isInteger(p.stock) &&
  p.stock >= 0 &&
  (p.oldPrice === null || (Number.isInteger(p.oldPrice) && p.oldPrice > 0));

// Ang clothing ug shoes kinahanglan og kapin sa usa ka size, walay doble
const sizesAreValid = (category: string, sizes: productRepo.SizeInput[]) => {
  if (!sizedCategories.includes(category)) return true;
  if (sizes.length === 0) return false;

  const seen = new Set<string>();
  for (const s of sizes) {
    if (!s.size || s.size.length > 10) return false;
    if (!Number.isInteger(s.stock) || s.stock < 0) return false;

    const key = s.size.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
};

const invalidMessage =
  "Name, category, and a valid price are required. For clothing and shoes, add at least one size with its stock.";

export const getProducts = async (req: Request, res: Response) => {
  const q = req.query;
  const products = await productRepo.getAll({
    category: toText(q.category),
    search: toText(q.search),
    minPrice: toNumber(q.minPrice),
    maxPrice: toNumber(q.maxPrice),
    featured: q.featured === "true",
    tag: toText(q.tag),
    sort: toText(q.sort),
  });
  res.json(products);
};

// Para sa admin: 15 per page + search + category
export const getAdminProducts = async (req: Request, res: Response) => {
  const result = await productRepo.getPage({
    page: toNumber(req.query.page),
    limit: toNumber(req.query.limit),
    search: toText(req.query.search),
    category: toText(req.query.category),
  });
  res.json(result);
};

export const getProduct = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Product not found" });
  }
  const product = await productRepo.getById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
};

export const createProduct = async (req: Request, res: Response) => {
  const data = readProduct(req.body);
  const sizes = sizedCategories.includes(data.category)
    ? readSizes(req.body)
    : [];

  if (!isValid(data) || !sizesAreValid(data.category, sizes)) {
    return res.status(400).json({ message: invalidMessage });
  }

  const created = await productRepo.add(data, sizes);
  await logAudit({
    action: "product.create",
    entity: "product",
    entityId: created.id,
    actorName: "Admin",
    details: `Created "${created.name}" (${created.category}) at ${created.price}`,
  });
  res.status(201).json(created);
};

export const updateProduct = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const data = readProduct(req.body);
  const sizes = sizedCategories.includes(data.category)
    ? readSizes(req.body)
    : [];

  if (!isValid(data) || !sizesAreValid(data.category, sizes)) {
    return res.status(400).json({ message: invalidMessage });
  }
  if (id === null) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updated = await productRepo.update(id, data, sizes);
  if (!updated) {
    return res.status(404).json({ message: "Product not found" });
  }

  await logAudit({
    action: "product.update",
    entity: "product",
    entityId: id,
    actorName: "Admin",
    details: `Updated "${updated.name}", price ${updated.price}, stock ${updated.stock}`,
  });
  res.json(updated);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ message: "Product not found" });
  }
  const removed = await productRepo.remove(id);
  if (!removed) {
    return res.status(404).json({ message: "Product not found" });
  }

  await logAudit({
    action: "product.delete",
    entity: "product",
    entityId: id,
    actorName: "Admin",
    details: `Deleted product #${id}`,
  });
  res.json({ message: "Product deleted" });
};