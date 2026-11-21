import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Product } from "../../../types/product";
import { useCart } from "../../context/use-cart";
import { useAuth } from "../../context/use-auth";
import { useWishlist } from "../../context/use-wishlist";
import { peso } from "../../../lib/format";
import { imageUrl } from "../../../lib/image-url";
import { btnSmall } from "../../../lib/styles";
import ReportModal from "./report-modal";
import StarRating from "./star-rating";
import ReviewModal from "./review-modal";

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const onSale = product.oldPrice !== null;
  const isAdmin = user?.role === "admin";
  const hasSizes = product.sizes.length > 0;
  const selected = product.sizes.find((s) => s.size === size);
  const wished = isWishlisted(product.id);


  const percentOff =
    onSale && Number(product.oldPrice) > 0
      ? Math.round(
          ((Number(product.oldPrice) - Number(product.price)) /
            Number(product.oldPrice)) *
            100,
        )
      : 0;

  const goLogin = () => navigate("/login", { state: { from: location } });

  const handleAdd = () => {
    if (!user) {
      goLogin();
      return;
    }
  
    if (hasSizes && !size) {
      setSizeError(true);
      return;
    }
    addToCart(product, size);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  const handleWish = () => {
    if (!user) {
      goLogin();
      return;
    }
    toggleWishlist(product.id);
  };

  const handleReport = () => {
    if (!user) {
      goLogin();
      return;
    }
    setShowReport(true);
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white text-neutral-800">
      <div className="relative flex h-[220px] items-center justify-center bg-neutral-300">
        {product.image && (
          <img
            src={imageUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          {product.isNew && (
            <span className="rounded-full bg-magenta px-2 py-0.5 text-xs text-white">
              New
            </span>
          )}
          {onSale && (
            <span className="rounded-full bg-magenta px-2 py-0.5 text-xs text-white">
              {percentOff > 0 ? `Sale -${percentOff}%` : "Sale"}
            </span>
          )}
        </div>

        {!isAdmin && (
          <button
            type="button"
            onClick={handleWish}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute right-2 top-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              strokeWidth="2"
              className={`h-5 w-5 ${
                wished
                  ? "fill-magenta stroke-magenta"
                  : "fill-none stroke-neutral-600"
              }`}
            >
              <path d="M12 21s-7-4.35-9.5-8.5C0.5 8.5 2.5 4 6.5 4c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 6 4.5 4 8.5C19 16.65 12 21 12 21z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="mb-1 text-base font-bold">{product.name}</h3>

        <button
          type="button"
          onClick={() => setShowReviews(true)}
          className="mb-1 flex cursor-pointer items-center gap-1 text-xs text-neutral-500"
        >
          <StarRating value={product.avgRating} size={14} />
          {product.reviewCount > 0
            ? `${product.avgRating} (${product.reviewCount})`
            : "No ratings yet"}
        </button>

        <p className="font-bold text-magenta">
          {peso(product.price)}
          {onSale && (
            <span className="ml-2 font-normal text-neutral-500 line-through">
              {peso(product.oldPrice!)}
            </span>
          )}
          {onSale && percentOff > 0 && (
            <span className="ml-2 text-xs font-semibold text-green-600">
              {percentOff}% off
            </span>
          )}
        </p>
        <p className="text-sm text-neutral-500">
          {product.stock < 1
            ? "Out of stock"
            : selected
              ? `${selected.stock} left (size ${selected.size})`
              : `${product.stock} in stock`}
        </p>

        {hasSizes && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-1.5">
              {product.sizes.map((s) => {
                const soldOut = s.stock < 1;
                const active = size === s.size;
                return (
                  <button
                    key={s.size}
                    type="button"
                    disabled={soldOut || isAdmin}
                    onClick={() => {
                      setSize(s.size);
                      setSizeError(false);
                    }}
                    className={`min-w-9 rounded-md border px-2 py-1 text-xs ${
                      active
                        ? "border-magenta bg-magenta text-white"
                        : "border-neutral-300 hover:border-magenta"
                    } ${
                      soldOut
                        ? "cursor-not-allowed text-neutral-400 line-through opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {s.size}
                  </button>
                );
              })}
            </div>
            {sizeError && (
              <p className="mt-1 text-xs text-red-600">Please select a size</p>
            )}
          </div>
        )}

        {isAdmin ? (
          <p className="mt-2 text-xs text-neutral-500">
            Admin view (shopping is for customers)
          </p>
        ) : (
          <>
            <button
              className={`${btnSmall} mt-2`}
              onClick={handleAdd}
              disabled={product.stock < 1}
            >
              {added ? "Added!" : "Add to Cart"}
            </button>
            <button
              type="button"
              className="mt-2 block cursor-pointer text-xs text-neutral-500 underline"
              onClick={handleReport}
            >
              Report this item
            </button>
          </>
        )}
      </div>

      {showReviews && (
        <ReviewModal product={product} onClose={() => setShowReviews(false)} />
      )}
      {showReport && (
        <ReportModal product={product} onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}

export default ProductCard;