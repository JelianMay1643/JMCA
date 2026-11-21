import api from "../lib/axios";

export type Refund = {
  id: number;
  orderId: string;
  amount: number;
  reason: string;
  paymentProvider: string | null;
  paymentNumber: string | null;
  status: "requested" | "refunded" | "rejected";
  adminNote: string | null;
  requestedAt: string;
  processedAt: string | null;
  customerName: string;
  email: string;
};


export const requestRefund = async (orderId: string, reason = "") => {
  const res = await api.post(`/api/refunds/order/${orderId}`, { reason });
  return res.data;
};


export const getRefunds = async (): Promise<Refund[]> => {
  const res = await api.get("/api/refunds");
  return res.data;
};


export const decideRefund = async (
  id: number,
  status: "refunded" | "rejected",
  adminNote = ""
) => {
  const res = await api.patch(`/api/refunds/${id}`, { status, adminNote });
  return res.data;
};