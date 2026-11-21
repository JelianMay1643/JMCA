import api from "../lib/axios";

export type PaymentDetails = {
  paymentProvider: string | null;
  paymentNumber: string | null;
};

export const getPayment = async (): Promise<PaymentDetails> => {
  const res = await api.get("/api/payment");
  return res.data;
};

export const savePayment = async (
  paymentProvider: string,
  paymentNumber: string
): Promise<PaymentDetails> => {
  const res = await api.put("/api/payment", { paymentProvider, paymentNumber });
  return res.data;
};