import api from "../lib/axios";

export async function getWishlist(): Promise<number[]> {
  const res = await api.get("/api/wishlist");
  return res.data.productIds;
}

export async function addWishlist(productId: number) {
  await api.post(`/api/wishlist/${productId}`);
}

export async function removeWishlist(productId: number) {
  await api.delete(`/api/wishlist/${productId}`);
}