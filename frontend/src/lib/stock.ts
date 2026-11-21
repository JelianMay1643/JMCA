import type { Product } from "../types/product";


export const stockFor = (product: Product, size: string | null) =>
  size
    ? (product.sizes.find((s) => s.size === size)?.stock ?? 0)
    : product.stock;