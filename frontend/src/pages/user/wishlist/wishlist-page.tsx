import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../../../types/product";
import { getProducts } from "../../../services/product-service";
import { useWishlist } from "../../../components/context/use-wishlist";
import ProductCard from "../../../components/features/product/product-card";

function WishlistPage() {
  const { ids } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const wished = products.filter((p) => ids.includes(p.id));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-magenta">My Wishlist</h1>

      {loading ? (
        <p>Loading...</p>
      ) : wished.length === 0 ? (
        <div className="text-center">
          <p className="mb-4 text-neutral-500">Your wishlist is empty!!</p>
          <Link to="/shop" className="font-bold text-magenta underline">
            Explore Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wished.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

export default WishlistPage;