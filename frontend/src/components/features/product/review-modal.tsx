import { useEffect, useState } from "react";
import type { Product } from "../../../types/product";
import {
  getMyReview,
  getReviews,
  saveReview,
  type MyReview,
  type Review,
} from "../../../services/review-service";
import { useAuth } from "../../context/use-auth";
import StarRating from "./star-rating";

function ReviewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mine, setMine] = useState<MyReview | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setReviews(await getReviews(product.id));
    if (user?.role === "customer") {
      const m = await getMyReview(product.id);
      setMine(m);
      if (m.myReview) {
        setRating(m.myReview.rating);
        setComment(m.myReview.comment);
      }
    }
  };

  useEffect(() => {
    load().catch(() => setMessage("Failed to load reviews"));
    
  }, [product.id]);

  const submit = async () => {
    if (rating < 1) return setMessage("Choose a star rating");
    try {
      await saveReview(product.id, rating, comment);
      setMessage("Thank you for your rating!");
      await load();
    } catch {
      setMessage("The rating cannot be saved");
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-4 text-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <button onClick={onClose} className="cursor-pointer text-xl">
            ×
          </button>
        </div>

        {mine?.canReview ? (
          <div className="mb-4 rounded-md border border-neutral-200 p-3">
            <p className="mb-1 text-sm font-bold">
              {mine.myReview ? "change your rating" : "rate the product"}
            </p>
            <StarRating value={rating} size={24} onChange={setRating} />
            <textarea
              className="mt-2 w-full rounded-md border border-neutral-300 p-2 text-sm"
              rows={3}
              maxLength={500}
              placeholder="Comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={submit}
              className="mt-2 cursor-pointer rounded-md bg-magenta px-3 py-1 text-sm text-white"
            >
              Submit
            </button>
          </div>
        ) : (
          user?.role === "customer" && (
            <p className="mb-4 text-xs text-neutral-500">
              You can only leave a rating once your order for this product has been received.
            </p>
          )
        )}
        {message && <p className="mb-2 text-sm text-magenta">{message}</p>}

        {reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No ratings yet.</p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="border-t border-neutral-200 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{r.userName}</span>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && <p className="text-sm">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewModal;