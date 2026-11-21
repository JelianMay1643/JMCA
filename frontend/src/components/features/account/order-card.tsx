import { useEffect, useState } from "react";
import type { Order } from "../../../types/order";
import { peso } from "../../../lib/format";
import { paymentLabels, statusColors } from "../../../lib/order-status";
import { btnDanger, btnSmall } from "../../../lib/styles";

const WINDOW_MS = 10 * 60 * 1000;

type Props = {
  order: Order;
  onCancel?: (id: string) => void;
  onRefund?: (id: string) => void;
  busy?: boolean;
};

const refundBadge: Record<string, { text: string; cls: string }> = {
  requested: { text: "Refund requested", cls: "bg-yellow-100 text-yellow-800" },
  refunded: { text: "Refunded", cls: "bg-green-100 text-green-800" },
  rejected: { text: "Refund rejected", cls: "bg-red-100 text-red-800" },
};

const formatLeft = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

function OrderCard({ order, onCancel, onRefund, busy = false }: Props) {
  const end = new Date(order.createdAt).getTime() + WINDOW_MS;
  const [left, setLeft] = useState(end - Date.now());

  useEffect(() => {
    if (order.status !== "pending") return;
    const timer = setInterval(() => setLeft(end - Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end, order.status]);

  const canCancel = order.status === "pending" && left > 0;
  const cancelledInTime =
    order.cancelledAt !== null &&
    new Date(order.cancelledAt).getTime() -
      new Date(order.createdAt).getTime() <=
      WINDOW_MS + 1000;
  const canRefund =
    order.status === "cancelled" &&
    order.paymentStatus === "paid" &&
    order.refundStatus === "none" &&
    cancelledInTime;
  const badge = refundBadge[order.refundStatus];

  return (
    <div className="rounded-lg bg-white p-4 text-neutral-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold">{order.id}</p>
          <p className="text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {badge && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${badge.cls}`}
            >
              {badge.text}
            </span>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
              statusColors[order.status] ?? "bg-neutral-100 text-neutral-800"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="my-3 border-t border-neutral-200 pt-3 text-sm">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.size ?? ""}`}
            className="flex justify-between gap-3 py-0.5"
          >
            <span>
              {item.name}
              {item.size ? ` (${item.size})` : ""} x{item.quantity}
            </span>
            <span>{peso(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3">
        <div className="text-sm">
          <p>
            Payment: {paymentLabels[order.paymentMethod]} ({order.paymentStatus})
          </p>
          <p className="text-neutral-500">Deliver to: {order.address}</p>
        </div>
        <p className="text-lg font-bold text-magenta">{peso(order.total)}</p>
      </div>

      {onCancel && canCancel && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            className={btnDanger}
            disabled={busy}
            onClick={() => onCancel(order.id)}
          >
            {busy ? "Cancelling..." : "Cancel Order"}
          </button>
          <span className="text-xs text-neutral-500">
           {formatLeft(left)}
          </span>
        </div>
      )}

      {order.status === "pending" && !canCancel && (
        <p className="mt-3 text-xs text-neutral-500">
          You can't cancel this order.
        </p>
      )}

      {onRefund && canRefund && (
        <div className="mt-3">
          <button
            className={btnSmall}
            disabled={busy}
            onClick={() => onRefund(order.id)}
          >
            {busy ? "Sending..." : "Request Refund"}
          </button>
          <p className="mt-1 text-xs text-neutral-500">
            Please refund it to the payment number.
          </p>
        </div>
      )}
    </div>
  );
}

export default OrderCard;