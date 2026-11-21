import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./use-auth";
import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../../services/wishlist-service";

type WishlistValue = {
  ids: number[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
};

export const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    getWishlist()
      .then(setIds)
      .catch(() => setIds([]));
  }, [user]);

  const isWishlisted = useCallback(
    (productId: number) => ids.includes(productId),
    [ids],
  );

  const toggleWishlist = useCallback(
    async (productId: number) => {
      if (ids.includes(productId)) {
        setIds((prev) => prev.filter((id) => id !== productId)); // optimistic
        try {
          await removeWishlist(productId);
        } catch {
          setIds((prev) => [...prev, productId]);
        }
      } else {
        setIds((prev) => [...prev, productId]);
        try {
          await addWishlist(productId);
        } catch {
          setIds((prev) => prev.filter((id) => id !== productId));
        }
      }
    },
    [ids],
  );

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}