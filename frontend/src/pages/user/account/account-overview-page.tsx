import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../components/context/use-auth";
import OrderCard from "../../../components/features/account/order-card";
import { getMyOrders } from "../../../services/order-service";
import { getErrorMessage } from "../../../lib/error";
import { peso } from "../../../lib/format";
import { btn } from "../../../lib/styles";
import type { Order } from "../../../types/order";

function Stat({
  label,
  value,
  to,
}: {
  label: string;
  value: string | number;
  to?: string;
}) {
  const body = (
    <>
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="text-2xl font-bold text-magenta">{value}</p>
    </>
  );
  const cls = "rounded-lg bg-white p-4 text-neutral-800";

  return to ? (
    <Link to={to} className={`${cls} block hover:ring-2 hover:ring-magenta`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function AccountOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyOrders()
      .then(setOrders)
      .catch((err) =>
        setError(getErrorMessage(err, "Failed to load your orders"))
      )
      .finally(() => setLoading(false));
  }, []);

  const count = (status: string) =>
    orders.filter((o) => o.status === status).length;

  const refunds = orders.filter((o) => o.refundStatus !== "none").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const recent = orders.slice(0, 3);

  return (
    <div>
      <h1 className="mb-1 text-3xl font-bold">Welcome, {user?.name}!</h1>
      <p className="mb-6">Here is a summary of your account.</p>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat
              label="Total Orders"
              value={orders.length}
              to="/account/orders"
            />
            <Stat
              label="Pending"
              value={count("pending")}
              to="/account/orders?status=pending"
            />
            <Stat
              label="Processing"
              value={count("processing")}
              to="/account/orders?status=processing"
            />
            <Stat
              label="Shipped"
              value={count("shipped")}
              to="/account/orders?status=shipped"
            />
            <Stat
              label="Completed (Delivered)"
              value={count("delivered")}
              to="/account/orders?status=delivered"
            />
            <Stat
              label="Cancelled"
              value={count("cancelled")}
              to="/account/orders?status=cancelled"
            />
            <Stat label="Refunds" value={refunds} />
            <Stat label="Total Spent" value={peso(totalSpent)} />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            {orders.length > 0 && (
              <Link to="/account/orders" className="text-sm underline">
                View all
              </Link>
            )}
          </div>

          {recent.length === 0 ? (
            <div className="rounded-lg bg-white/15 p-6 text-center">
              <p className="mb-4">You have no orders yet.</p>
              <Link to="/shop" className={btn}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {recent.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AccountOverviewPage;