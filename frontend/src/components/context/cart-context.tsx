import { useEffect, useState, type ReactNode } from "react";
import type { Product } from "../../types/product";
import { stockFor } from "../../lib/stock";
import { CartContext, type CartItem } from "./cart-state";


const STORAGE_KEY = "jmca-cart-v2";

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const isSame = (item: CartItem, productId: number, size: string | null) =>
  item.product.id === productId && item.size === size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Product, size: string | null) => {
    const max = stockFor(product, size);
    if (max < 1) return;

    setItems((prev) => {
      const found = prev.find((i) => isSame(i, product.id, size));
      if (found) {
        return prev.map((i) =>
          isSame(i, product.id, size)
            ? { ...i, quantity: Math.min(i.quantity + 1, max) }
            : i
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number, size: string | null) => {
    setItems((prev) => prev.filter((i) => !isSame(i, productId, size)));
  };

  const updateQuantity = (
    productId: number,
    size: string | null,
    quantity: number
  ) => {
    if (quantity < 1) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        isSame(i, productId, size)
          ? { ...i, quantity: Math.min(quantity, stockFor(i.product, size)) }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}