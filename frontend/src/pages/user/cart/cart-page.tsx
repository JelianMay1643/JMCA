import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useCart } from "../../../components/context/use-cart";
import { peso } from "../../../lib/format";
import { imageUrl } from "../../../lib/image-url";
import { stockFor } from "../../../lib/stock";
import { btn } from "../../../lib/styles";

function CartPage() {
  const { items, totalPrice, updateQuantity, removeFromCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#d47dbf] px-4 py-10 text-center text-white">
        <h1 className="mb-4 text-3xl font-bold">Your Cart</h1>
        <p className="mb-4">Your cart is empty.</p>
        <Link to="/shop" className={btn}>
          Go to Shop
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[#d47dbf] text-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-4 text-3xl font-bold">Your Cart</h1>

        <div>
          {items.map(({ product, size, quantity }) => (
            <div
              key={`${product.id}-${size ?? "none"}`}
              className="mb-3 flex flex-wrap items-center gap-4 rounded-lg bg-white p-3 text-neutral-800"
            >
              <div className="h-16 w-16 flex-none overflow-hidden rounded-md bg-neutral-300">
                {product.image && (
                  <img
                    src={imageUrl(product.image)}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{product.name}</h3>
                {size && (
                  <p className="text-sm text-neutral-500">Size: {size}</p>
                )}
                <p>{peso(product.price)}</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => updateQuantity(product.id, size, quantity - 1)}
                  className="h-7 w-7 cursor-pointer rounded-full bg-brand text-white"
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => updateQuantity(product.id, size, quantity + 1)}
                  disabled={quantity >= stockFor(product, size)}
                  className="h-7 w-7 cursor-pointer rounded-full bg-brand text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>

              <p className="w-24 text-right font-bold text-magenta">
                {peso(product.price * quantity)}
              </p>

              <button
                onClick={() => removeFromCart(product.id, size)}
                aria-label="Remove item"
                className="cursor-pointer text-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Total: {peso(totalPrice)}</h2>
          <Link to="/checkout" className={btn}>
            Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CartPage;