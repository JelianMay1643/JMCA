import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Product, ProductSize } from "../../../types/product";
import type { ProductInput } from "../../../services/admin-service";
import { getErrorMessage } from "../../../lib/error";
import { imageUrl } from "../../../lib/image-url";
import { fileToDataUrl, resizeImage } from "../../../lib/resize-image";
import { btnSmall, btnOutline } from "../../../lib/styles";

export type SaveOptions = { file: File | null; removeImage: boolean };

type Props = {
  product?: Product;
  onSave: (data: ProductInput, options: SaveOptions) => Promise<void>;
  onCancel: () => void;
};

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];


const presets: Record<string, string[]> = {
  clothing: ["XS", "S", "M", "L", "XL", "XXL"],
  shoes: ["35", "36", "37", "38", "39", "40", "41", "42"],
};

const label = "flex flex-col gap-1 text-sm";
const input = "rounded-md border border-neutral-300 p-2 text-sm";
const check = "flex items-center gap-2 text-sm";


const sortSizes = (list: ProductSize[], category: string) => {
  const order = presets[category] ?? [];
  const rank = (s: string) => {
    const i = order.indexOf(s);
    return i === -1 ? order.length : i;
  };
  return [...list].sort((a, b) => rank(a.size) - rank(b.size));
};

function ProductForm({ product, onSave, onCancel }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<Product["category"]>(
    product?.category ?? "clothing"
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [oldPrice, setOldPrice] = useState(
    product?.oldPrice ? String(product.oldPrice) : ""
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "0");
  const [description, setDescription] = useState(product?.description ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [isNew, setIsNew] = useState(product?.isNew ?? false);

  // Sizes
  const [sizes, setSizes] = useState<ProductSize[]>(product?.sizes ?? []);
  const [customSize, setCustomSize] = useState("");
  const sized = category === "clothing" || category === "shoes";
  const totalStock = sizes.reduce((sum, s) => sum + s.stock, 0);

  // Percent off sale 
  const percentOff =
    oldPrice && Number(oldPrice) > Number(price) && Number(price) > 0
      ? Math.round(((Number(oldPrice) - Number(price)) / Number(oldPrice)) * 100)
      : 0;

  // Picture
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const shownImage = file
    ? preview
    : removeImage
      ? ""
      : product?.image
        ? imageUrl(product.image)
        : "";

  // --- Category and sizes ---

  const handleCategory = (next: Product["category"]) => {
    setCategory(next);
    setCustomSize("");
    setError("");

    if (next === "beauty") {
      setSizes([]);
    } else {
      
      setSizes(product && product.category === next ? product.sizes : []);
    }
  };

  const togglePreset = (value: string) => {
    setSizes((prev) =>
      prev.some((s) => s.size === value)
        ? prev.filter((s) => s.size !== value)
        : sortSizes([...prev, { size: value, stock: 0 }], category)
    );
  };

  const addAllPresets = () => {
    setSizes((prev) => {
      const missing = (presets[category] ?? [])
        .filter((p) => !prev.some((s) => s.size === p))
        .map((p) => ({ size: p, stock: 0 }));
      return sortSizes([...prev, ...missing], category);
    });
  };

  const addCustom = () => {
    const value = customSize.trim();
    if (!value) return;
    if (value.length > 10) {
      setError("Size name is too long (max 10 characters)");
      return;
    }
    if (sizes.some((s) => s.size.toLowerCase() === value.toLowerCase())) {
      setError("That size is already added");
      return;
    }
    setError("");
    setSizes((prev) => sortSizes([...prev, { size: value, stock: 0 }], category));
    setCustomSize("");
  };

  const removeSize = (value: string) =>
    setSizes((prev) => prev.filter((s) => s.size !== value));

  const setSizeStock = (value: string, raw: string) => {
    const n = Number(raw);
    const stockValue = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    setSizes((prev) =>
      prev.map((s) => (s.size === value ? { ...s, stock: stockValue } : s))
    );
  };

  // --- Picture ---

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = ""; 
    if (!selected) return;

    setError("");
    if (!allowedTypes.includes(selected.type)) {
      setError("Only JPG, PNG, or WebP images are allowed");
      return;
    }
    if (selected.size > 15 * 1024 * 1024) {
      setError("This image is too large (max 15MB)");
      return;
    }

    setProcessing(true);
    try {
      const resized = await resizeImage(selected);
      setFile(resized);
      setPreview(await fileToDataUrl(resized));
      setRemoveImage(false);
    } catch {
      setError("Could not read this image. Please try another file.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = () => {
    if (file) {
      
      setFile(null);
      setPreview("");
    } else {
      setRemoveImage(true);
    }
  };

  // --- Save ---

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (Number(price) <= 0) {
      setError("Price must be greater than 0");
      return;
    }
    if (oldPrice && Number(oldPrice) <= Number(price)) {
      setError("Old price must be higher than the price");
      return;
    }
    if (sized && sizes.length === 0) {
      setError("Add at least one size for clothing and shoes");
      return;
    }
    if (!sized && Number(stock) < 0) {
      setError("Stock cannot be negative");
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          category,
          price: Number(price),
          oldPrice: oldPrice ? Number(oldPrice) : null,
        
          stock: sized ? totalStock : Number(stock),
          description,
          
          image: product?.image ?? "",
          featured,
          isNew,
          sizes: sized ? sizes : [],
        
          avgRating: product?.avgRating ?? 0,
          reviewCount: product?.reviewCount ?? 0,
        },
        { file, removeImage }
      );
    } catch (err) {
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-white p-4 md:grid-cols-2"
    >
      <h2 className="text-xl font-bold md:col-span-2">
        {product ? "Edit Product" : "Add Product"}
      </h2>

      <label className={label}>
        Name
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} required />
      </label>

      <label className={label}>
        Category
        <select
          className={input}
          value={category}
          onChange={(e) => handleCategory(e.target.value as Product["category"])}
        >
          <option value="clothing">Clothing</option>
          <option value="beauty">Beauty</option>
          <option value="shoes">Shoes</option>
        </select>
      </label>

      <label className={label}>
        Price (₱)
        <input className={input} type="number" min="1" value={price} onChange={(e) => setPrice(e.target.value)} required />
      </label>

      <label className={label}>
        Old Price (₱, optional, for sale)
        <input className={input} type="number" min="1" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} />
        {percentOff > 0 && (
          <span className="text-xs font-semibold text-green-600">
            Sale: {percentOff}% off
          </span>
        )}
      </label>

      {!sized && (
        <label className={label}>
          Stock
          <input className={input} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
        </label>
      )}

      {sized && (
        <div className="md:col-span-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm">Sizes and Stock</p>
            <p className="text-sm text-neutral-500">
              Total stock: <b className="text-magenta">{totalStock}</b>
            </p>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            {presets[category].map((value) => {
              const active = sizes.some((s) => s.size === value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePreset(value)}
                  className={`min-w-10 cursor-pointer rounded-md border px-2.5 py-1 text-xs ${
                    active
                      ? "border-magenta bg-magenta text-white"
                      : "border-neutral-300 hover:border-magenta"
                  }`}
                >
                  {value}
                </button>
              );
            })}
            <button
              type="button"
              onClick={addAllPresets}
              className="cursor-pointer text-xs text-magenta underline"
            >
              Add all
            </button>
          </div>

          {sizes.length === 0 ? (
            <p className="text-sm text-neutral-500">
        
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sizes.map((s) => (
                <div
                  key={s.size}
                  className="flex items-center gap-2 rounded-md border border-neutral-300 p-2"
                >
                  <span className="w-10 flex-none text-sm font-bold">
                    {s.size}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={s.stock}
                    onChange={(e) => setSizeStock(s.size, e.target.value)}
                    aria-label={`Stock for size ${s.size}`}
                    className="w-full min-w-0 rounded border border-neutral-300 p-1 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(s.size)}
                    aria-label={`Remove size ${s.size}`}
                    className="cursor-pointer text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <input
              className={`${input} w-40`}
              placeholder="Custom size"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustom();
                }
              }}
            />
            <button type="button" className={btnOutline} onClick={addCustom}>
              Add size
            </button>
          </div>
        </div>
      )}

      <div className="md:col-span-2">
        <p className="mb-1 text-sm">Product Image</p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-md bg-neutral-200 text-xs text-neutral-500">
            {shownImage ? (
              <img
                src={shownImage}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              "No image"
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="hidden"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className={btnSmall}
                onClick={() => fileInput.current?.click()}
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : shownImage
                    ? "Change Image"
                    : "Choose Image"}
              </button>
              {shownImage && (
                <button
                  type="button"
                  className={btnOutline}
                  onClick={handleRemove}
                  disabled={processing}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              JPG, PNG, o WebP.
            </p>
          </div>
        </div>
      </div>

      <label className={`${label} md:col-span-2`}>
        Description
        <textarea className={`${input} h-20`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>

      <label className={check}>
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured 
      </label>

      <label className={check}>
        <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
        New in
      </label>

      {error && (
        <p className="rounded-md bg-red-100 px-3 py-2 text-red-800 md:col-span-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 md:col-span-2">
        <button type="submit" className={btnSmall} disabled={saving || processing}>
          {saving ? "Saving..." : "Save"}
        </button>
        <button type="button" className={btnOutline} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ProductForm;