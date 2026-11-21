import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../../components/context/use-auth";
import { useCart } from "../../../components/context/use-cart";
import { createOrder } from "../../../services/order-service";
import { peso } from "../../../lib/format";
import { btn } from "../../../lib/styles";
import type { PaymentMethod } from "../../../types/order";

const paymentOptions: { value: PaymentMethod; label: string; note: string }[] = [
  { value: "cod", label: "Cash on Delivery", note: "Pay when your order arrives." },
  { value: "gcash", label: "GCash", note: "Simulation only. No real payment is made." },
  { value: "card", label: "Credit / Debit Card", note: "Simulation only. Do not enter real card details." },
  { value: "bank", label: "Bank Transfer", note: "Simulation only. No real payment is made." },
];

const field =
  "rounded-md bg-white p-2.5 text-[15px] text-neutral-800 outline-none";

function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: user?.name ?? "",
    email: user?.email ?? "",
    phone: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#d47dbf] px-4 py-10 text-center text-white">
        <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
        <p className="mb-4">Your cart is empty.</p>
        <Link to="/shop" className={btn}>
          Go to Shop
        </Link>
      </main>
    );
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const order = await createOrder({
        ...form,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.product.id,
          size: i.size,
          quantity: i.quantity,
        })),
      });
      navigate("/order-success", { state: { order } });
      clearCart();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Something went wrong. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-[#d47dbf] text-white">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-4 text-3xl font-bold">Checkout</h1>

        <div className="flex flex-wrap items-start gap-6">
          <form
            onSubmit={handleSubmit}
            className="flex min-w-[280px] flex-[2] flex-col gap-3 rounded-lg bg-magenta p-5"
          >
            <h2 className="mt-2 text-xl font-bold">Your Details</h2>
            <input
              name="customerName"
              placeholder="Full Name"
              value={form.customerName}
              onChange={handleChange}
              required
              className={field}
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className={field}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              className={field}
            />
            <textarea
              name="address"
              placeholder="Complete Address"
              value={form.address}
              onChange={handleChange}
              required
              className={`${field} h-20`}
            />

            <h2 className="mt-2 text-xl font-bold">Payment Method</h2>
            {paymentOptions.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-2.5 rounded-md bg-white/15 p-2.5"
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-1"
                />
                <span className="flex flex-col">
                  <b>{opt.label}</b>
                  <small className="text-blush">{opt.note}</small>
                </span>
              </label>
            ))}

            {error && (
              <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className={btn}>
              {submitting ? "Placing order..." : "Place Order"}
            </button>
          </form>

          <aside className="min-w-[240px] flex-1 rounded-lg bg-white p-5 text-neutral-800">
            <h2 className="mb-2 text-xl font-bold">Order Summary</h2>
            {items.map(({ product, size, quantity }) => (
              <div
                key={`${product.id}-${size ?? "none"}`}
                className="flex justify-between gap-3 py-1.5"
              >
                <span>
                  {product.name}
                  {size ? ` (${size})` : ""} x{quantity}
                </span>
                <span>{peso(product.price * quantity)}</span>
              </div>
            ))}
            <div className="mt-2 flex justify-between gap-3 border-t border-neutral-300 pt-2 font-bold text-magenta">
              <span>Total</span>
              <span>{peso(totalPrice)}</span>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default CheckoutPage;