import { Link, Navigate, useLocation } from "react-router-dom";
import { peso } from "../../../lib/format";
import { btn } from "../../../lib/styles";
import type { Order } from "../../../types/order";

const paymentLabels = {
  cod: "Cash on Delivery",
  gcash: "GCash",
  card: "Credit / Debit Card",
  bank: "Bank Transfer",
};

function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  
  if (!order) return <Navigate to="/" replace />;

  return (
    <main className="min-h-[70vh] bg-[#d47dbf] px-4 py-10 text-white">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-2 text-3xl font-bold">Thank you for your order!</h1>
        <p>
          Your order number is <b>{order.id}</b>
        </p>

        <div className="my-4 rounded-lg bg-white p-5 text-left text-neutral-800">
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-3 py-1.5">
              <span>
                {item.name}{item.size ? ` (${item.size})` : ""} x{item.quantity}
              </span>
              <span>{peso(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between gap-3 border-t border-neutral-300 pt-2 font-bold text-magenta">
            <span>Total</span>
            <span>{peso(order.total)}</span>
          </div>
        </div>

        <p className="mb-1">
          Payment: {paymentLabels[order.paymentMethod]} ({order.paymentStatus})
        </p>
        <p className="mb-6">We will deliver to: {order.address}</p>

        <Link to="/shop" className={btn}>
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default OrderSuccessPage;