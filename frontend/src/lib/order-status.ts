import type { PaymentMethod } from "../types/order";

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const paymentLabels: Record<PaymentMethod, string> = {
  cod: "Cash on Delivery",
  gcash: "GCash",
  card: "Credit / Debit Card",
  bank: "Bank Transfer",
};