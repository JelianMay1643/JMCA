import { useEffect, useState } from "react";
import type { Product } from "../../../types/product";
import { getAdminProducts } from "../../../services/product-service";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  type ProductInput,
} from "../../../services/admin-service";
import ProductForm, {
  type SaveOptions,
} from "../../../components/features/admin/product-form";
import { TableSkeleton } from "../../../components/common/skeleton";
import { peso } from "../../../lib/format";
import { imageUrl } from "../../../lib/image-url";
import { getErrorMessage } from "../../../lib/error";
import { btnSmall, btnDanger } from "../../../lib/styles";

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5 align-middle";
const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

const PER_PAGE = 15;

function StockBadge({ stock }: { stock: number }) {
  const style =
    stock === 0
      ? "bg-red-100 text-red-800"
      : stock <= 5
        ? "bg-yellow-100 text-yellow-800"
        : "bg-green-100 text-green-800";

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${style}`}>
      {stock === 0 ? "Out of stock" : stock}
    </span>
  );
}

function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    getAdminProducts({
      page,
      limit: PER_PAGE,
      search: debouncedSearch,
      category: categoryFilter === "all" ? undefined : categoryFilter,
    })
      .then((res) => {
        if (cancelled) return;
        
        if (res.items.length === 0 && page > 1) {
          setPage(page - 1);
          return;
        }
        setProducts(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load products"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, categoryFilter, refresh]);

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
  };

  const handleSave = async (
    data: ProductInput,
    { file, removeImage }: SaveOptions
  ) => {
    setError("");

    const saved = editing
      ? await updateProduct(editing.id, data)
      : await createProduct(data);

    try {
      if (file) {
        await uploadProductImage(saved.id, file);
      } else if (removeImage && editing) {
        await deleteProductImage(saved.id);
      }
    } catch (err) {
      closeForm();
      setRefresh((n) => n + 1);
      setError(
        `Product saved, but the image failed: ${getErrorMessage(err)}`
      );
      return;
    }

    closeForm();
    setRefresh((n) => n + 1);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Products</h1>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className={field}
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={field}
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            <option value="clothing">Clothing</option>
            <option value="beauty">Beauty</option>
            <option value="shoes">Shoes</option>
          </select>
          {!adding && !editing && (
            <button className={btnSmall} onClick={() => setAdding(true)}>
              + Add Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {(adding || editing) && (
        <ProductForm
          key={editing?.id ?? "new"}
          product={editing ?? undefined}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={8} />
      ) : (
        <>
          <p className="mb-2 text-sm text-neutral-500">
            Showing {products.length} of {total} products
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead>
                <tr>
                  <th className={th}>Image</th>
                  <th className={th}>Name</th>
                  <th className={th}>Category</th>
                  <th className={th}>Price</th>
                  <th className={th}>Stock</th>
                  <th className={th}>Sizes</th>
                  <th className={th}>Tags</th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      <div className="h-12 w-12 overflow-hidden rounded-md bg-neutral-200">
                        {p.image && (
                          <img
                            src={imageUrl(p.image)}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className={td}>{p.name}</td>
                    <td className={`${td} capitalize`}>{p.category}</td>
                    <td className={td}>
                      {peso(p.price)}
                      {p.oldPrice && (
                        <small className="ml-2 text-neutral-500 line-through">
                          {peso(p.oldPrice)}
                        </small>
                      )}
                    </td>
                    <td className={td}>
                      <StockBadge stock={p.stock} />
                    </td>
                    <td className={`${td} text-xs`}>
                      {p.sizes.length === 0 ? (
                        <span className="text-neutral-400">-</span>
                      ) : (
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={s.stock === 0 ? "text-red-700" : ""}
                            >
                              <b>{s.size}</b>: {s.stock}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className={td}>
                      {p.featured && "Featured "}
                      {p.isNew && "New "}
                      {p.oldPrice && "Sale"}
                    </td>
                    <td className={td}>
                      <div className="flex gap-2">
                        <button
                          className={btnSmall}
                          onClick={() => {
                            setAdding(false);
                            setEditing(p);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={btnDanger}
                          onClick={() => handleDelete(p)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {products.length === 0 && (
              <p className="bg-white p-4 text-center text-sm text-neutral-500">
                No products match your search.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              className={`${btnSmall} disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <button
              className={`${btnSmall} disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminProductsPage;