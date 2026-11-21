export type PaymentMethod = "cod" | "gcash" | "card" | "bank";

export type RefundStatus = "none" | "requested" | "refunded" | "rejected";

export type OrderItem = {
  productId: number;
  name: string;
  size: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid";
  status: string;
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  refundStatus: RefundStatus;
};

export type CheckoutData = {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
  items: { productId: number; size: string | null; quantity: number }[];
};