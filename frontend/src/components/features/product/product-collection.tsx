import { useEffect, useState } from "react";
import type { Product } from "../../../types/product";
import {
  getProducts,
  type ProductFilters,
} from "../../../services/product-service";
import { Skeleton } from "../../common/skeleton";
import ProductCard from "./product-card";

function ProductCollection({ filters = {} }: { filters?: ProductFilters }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const key = JSON.stringify(filters);

  useEffect(() => {
    setLoading(true);
    setError("");
    getProducts(filters)
      .then(setProducts)
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
    
  }, [key]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-3">
            <Skeleton className="mb-3 aspect-[3/4] w-full" />
            <Skeleton className="mb-2 h-5 w-3/4" />
            <Skeleton className="mb-2 h-3 w-1/2" />
            <Skeleton className="mb-3 h-5 w-1/3" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
      </div>
    );
  }
  if (error) return <p className="text-center text-white">{error}</p>;
  if (products.length === 0) {
    return <p className="text-center text-white">No products found.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default ProductCollection;