import { createContext } from "react";
import type { Product } from "../../types/product";

export type CartItem = {
  product: Product;
  size: string | null;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (product: Product, size: string | null) => void;
  removeFromCart: (productId: number, size: string | null) => void;
  updateQuantity: (
    productId: number,
    size: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;
};

export const CartContext = createContext<CartState | undefined>(undefined);