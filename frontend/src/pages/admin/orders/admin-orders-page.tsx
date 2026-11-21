import { useEffect, useState } from "react";
import type { Order } from "../../../types/order";
import { getOrders, updateOrderStatus } from "../../../services/admin-service";
import { TableSkeleton } from "../../../components/common/skeleton";
import { peso } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/error";
import { paymentLabels, statusColors } from "../../../lib/order-status";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5 align-top";
const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err, "Failed to load orders")))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    setError("");
    try {
      const updated = await updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const q = search.trim().toLowerCase();
  const shown = orders.filter(
    (o) =>
      (filter === "all" || o.status === filter) &&
      (!q ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.includes(q))
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Orders</h1>

        <div className="flex flex-wrap gap-2">
          <input
            className={field}
            placeholder="Search order, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={field}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={6} />
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <>
          <p className="mb-2 text-sm text-neutral-500">
            Showing {shown.length} of {orders.length} orders
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead>
                <tr>
                  <th className={th}>Order #</th>
                  <th className={th}>Customer</th>
                  <th className={th}>Items</th>
                  <th className={th}>Total</th>
                  <th className={th}>Payment</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((o) => (
                  <tr key={o.id}>
                    <td className={td}>
                      <b>{o.id}</b>
                      <br />
                      <small>{new Date(o.createdAt).toLocaleString()}</small>
                    </td>
                    <td className={td}>
                      {o.customerName}
                      <br />
                      <small>{o.phone}</small>
                      <br />
                      <small>{o.address}</small>
                    </td>
                    <td className={td}>
                      {o.items.map((i) => (
                        <div key={i.productId}>
                          {i.name}
                          {i.size ? ` (${i.size})` : ""} x{i.quantity}
                        </div>
                      ))}
                    </td>
                    <td className={`${td} font-bold`}>{peso(o.total)}</td>
                    <td className={td}>
                      {paymentLabels[o.paymentMethod]}
                      <br />
                      <small>{o.paymentStatus}</small>
                    </td>
                    <td className={td}>
                      <select
                        className={`rounded-md px-2 py-1 text-xs font-bold capitalize ${
                          statusColors[o.status] ?? ""
                        }`}
                        value={o.status}
                        disabled={o.status === "cancelled"}
                        onChange={(e) => handleStatus(o.id, e.target.value)}
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {o.refundStatus !== "none" && (
                        <p className="mt-1 text-xs font-bold text-magenta">
                          Refund: {o.refundStatus}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {shown.length === 0 && (
              <p className="bg-white p-4 text-center text-sm text-neutral-500">
                No orders match your search.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOrdersPage;