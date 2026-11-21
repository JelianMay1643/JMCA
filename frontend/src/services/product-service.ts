import api from "../lib/axios";
import type { Product } from "../types/product";

export type ProductFilters = {
  category?: string;
  search?: string;
  tag?: string;
  sort?: string;
  featured?: boolean;
};

export type ProductPage = {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const getProducts = async (
  filters: ProductFilters = {}
): Promise<Product[]> => {
  const res = await api.get("/api/products", { params: filters });
  return res.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const res = await api.get(`/api/products/${id}`);
  return res.data;
};

// Para sa admin: paginated + search + category
export const getAdminProducts = async (params: {
  page: number;
  limit?: number;
  search?: string;
  category?: string;
}): Promise<ProductPage> => {
  const res = await api.get("/api/products/admin/list", { params });
  return res.data;
};