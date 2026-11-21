import api from "../lib/axios";
import type { CheckoutData, Order } from "../types/order";

export const createOrder = async (data: CheckoutData): Promise<Order> => {
  const res = await api.post("/api/orders", data);
  return res.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
  const res = await api.get("/api/orders/mine");
  return res.data;
};

export const cancelMyOrder = async (
  id: string,
  reason = ""
): Promise<Order> => {
  const res = await api.patch(`/api/orders/${id}/cancel`, { reason });
  return res.data;
};