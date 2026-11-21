import api from "../lib/axios";

export type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
};

export type MyReview = {
  canReview: boolean;
  myReview: { rating: number; comment: string } | null;
};

export async function getReviews(productId: number): Promise<Review[]> {
  const res = await api.get(`/api/reviews/product/${productId}`);
  return res.data;
}

export async function getMyReview(productId: number): Promise<MyReview> {
  const res = await api.get(`/api/reviews/product/${productId}/mine`);
  return res.data;
}

export async function saveReview(
  productId: number,
  rating: number,
  comment: string,
) {
  await api.post(`/api/reviews/product/${productId}`, { rating, comment });
}