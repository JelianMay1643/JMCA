export type ProductSize = {
  size: string;
  stock: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  description: string;
  image: string;
  featured: boolean;
  isNew: boolean;
  sizes: ProductSize[];
  avgRating: number;
  reviewCount: number;
};