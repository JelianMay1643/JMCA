import { useSearchParams } from "react-router-dom";
import ProductCollection from "../../../components/features/product/product-collection";

const field =
  "rounded-md bg-white px-3 py-2 text-sm text-neutral-800 outline-none";

function ShopPage() {
  const [params, setParams] = useSearchParams();

  const category = params.get("category") ?? "";
  const search = params.get("search") ?? "";
  const tag = params.get("tag") ?? "";
  const sort = params.get("sort") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <main className="min-h-[70vh] bg-[#d47dbf]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            className={field}
            value={category}
            onChange={(e) => setParam("category", e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="clothing">Clothing</option>
            <option value="beauty">Beauty</option>
            <option value="shoes">Shoes</option>
          </select>

          <input
            type="text"
            className={field}
            placeholder="Search product..."
            value={search}
            onChange={(e) => setParam("search", e.target.value)}
          />

          <select
            className={field}
            value={tag}
            onChange={(e) => setParam("tag", e.target.value)}
          >
            <option value="">All Products</option>
            <option value="new">New in</option>
            <option value="sale">On sale</option>
          </select>

          <select
            className={field}
            value={sort}
            onChange={(e) => setParam("sort", e.target.value)}
          >
            <option value="">Price</option>
            <option value="price-asc">Low to High</option>
            <option value="price-desc">High to Low</option>
          </select>
        </div>

        <ProductCollection filters={{ category, search, tag, sort }} />
      </div>
    </main>
  );
}

export default ShopPage;