import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import OrderCard from "../../../components/features/account/order-card";
import { CardListSkeleton } from "../../../components/common/skeleton";
import { cancelMyOrder, getMyOrders } from "../../../services/order-service";
import { requestRefund } from "../../../services/refund-service";
import { getErrorMessage } from "../../../lib/error";
import { btn } from "../../../lib/styles";
import type { Order } from "../../../types/order";

function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [params, setParams] = useSearchParams();
  const filter = params.get("status") ?? "all";
  const setFilter = (value: string) => {
    if (value === "all") setParams({});
    else setParams({ status: value });
  };
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) =>
        setError(getErrorMessage(err, "Failed to load your orders"))
      )
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm("Cancel this order?")) return;

    setError("");
    setNotice("");
    setBusyId(id);
    try {
      const updated = await cancelMyOrder(id);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      setNotice("Order cancelled.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRefund = async (id: string) => {
    const reason = window.prompt("Ngano mo-refund ka? (optional)");
    if (reason === null) return;

    setError("");
    setNotice("");
    setBusyId(id);
    try {
      await requestRefund(id, reason);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, refundStatus: "requested" } : o))
      );
      setNotice("Refund request sent. Hulaton ang admin.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const shown =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-md bg-white px-3 py-2 text-sm text-neutral-800 outline-none"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}{" "}
          {error.includes("Profile") && (
            <Link to="/account/profile" className="font-bold underline">
              Go to your profile.
            </Link>
          )}
        </p>
      )}
      {notice && (
        <p className="mb-4 rounded-md bg-green-100 px-3 py-2 text-green-800">
          {notice}
        </p>
      )}

      {loading ? (
        <CardListSkeleton count={3} />
      ) : shown.length === 0 ? (
        <div className="rounded-lg bg-white/15 p-6 text-center">
          <p className="mb-4">
            {orders.length === 0
              ? "You have no orders yet."
              : "No orders with this status."}
          </p>
          {orders.length === 0 && (
            <Link to="/shop" className={btn}>
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onCancel={handleCancel}
              onRefund={handleRefund}
              busy={busyId === o.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountOrdersPage;