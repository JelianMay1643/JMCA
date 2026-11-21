import { Request, Response } from "express";
import * as orderRepo from "@/repositories/order-repository";

const paymentMethods = ["cod", "gcash", "card", "bank"];
const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export const createOrder = async (req: Request, res: Response) => {
  const { customerName, email, phone, address, paymentMethod, items } =
    req.body;

  if (!customerName || !email || !phone || !address) {
    return res.status(400).json({ message: "Please fill in all your details" });
  }
  if (!paymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  // I-combine ang quantity kung parehas ang product ug size
  const lines = new Map<
    string,
    { productId: number; size: string | null; quantity: number }
  >();

  for (const item of items) {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);
    const size = item.size ? String(item.size).trim() : null;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "Invalid product" });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const key = `${productId}|${size ?? ""}`;
    const existing = lines.get(key);
    lines.set(key, {
      productId,
      size,
      quantity: (existing?.quantity ?? 0) + quantity,
    });
  }

  try {
    // Simulation lang: walay tinuod nga payment gateway
    const order = await orderRepo.create({
      // Gikan sa token sa naka-login (null kung admin ang nag-order)
      userId: res.locals.auth.userId,
      customerName: String(customerName).trim(),
      email: String(email).trim(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
      items: [...lines.values()],
    });
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof orderRepo.OrderError) {
      return res.status(400).json({ message: err.message });
    }
    throw err;
  }
};

// Customer: akong orders
export const getMyOrders = async (req: Request, res: Response) => {
  const userId = res.locals.auth.userId as number | null;
  if (userId === null) {
    return res.json([]);
  }
  res.json(await orderRepo.getByUser(userId));
};

// Customer: i-cancel ang akong order
export const cancelMyOrder = async (req: Request, res: Response) => {
  const userId = res.locals.auth.userId as number | null;
  if (userId === null) {
    return res.status(403).json({ message: "Customers only" });
  }

  const order = await orderRepo.cancelForUser(String(req.params.id), userId);
  if (!order) {
    return res
      .status(400)
      .json({ message: "This order can no longer be cancelled" });
  }
  res.json(order);
};

// Admin
export const getOrders = async (req: Request, res: Response) => {
  res.json(await orderRepo.getAll());
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!orderStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const order = await orderRepo.updateStatus(String(req.params.id), status);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }
  res.json(order);
};