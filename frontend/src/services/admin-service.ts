import api from "../lib/axios";
import type { Product, ProductSize } from "../types/product";
import type { Order } from "../types/order";

export type ProductInput = Omit<Product, "id" | "sizes"> & {
  sizes?: ProductSize[];
};

export const getOrders = async (): Promise<Order[]> => {
  const res = await api.get("/api/orders");
  return res.data;
};

export const updateOrderStatus = async (
  id: string,
  status: string
): Promise<Order> => {
  const res = await api.patch(`/api/orders/${id}/status`, { status });
  return res.data;
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
  const res = await api.post("/api/products", data);
  return res.data;
};

export const updateProduct = async (
  id: number,
  data: ProductInput
): Promise<Product> => {
  const res = await api.put(`/api/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/api/products/${id}`);
};

export const uploadProductImage = async (
  id: number,
  file: File
): Promise<Product> => {
  const form = new FormData();
  form.append("image", file);

  
  const res = await api.post(`/api/products/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProductImage = async (id: number): Promise<Product> => {
  const res = await api.delete(`/api/products/${id}/image`);
  return res.data;
};