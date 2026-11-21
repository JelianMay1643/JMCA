import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Banknote, Package, ShoppingCart, Users } from "lucide-react";
import { getStats } from "../../../services/stats-service";
import {
  BarChart,
  HBarList,
  Panel,
  StatCard,
  StatusBadge,
} from "../../../components/features/admin/dashboard-widgets";
import { Skeleton } from "../../../components/common/skeleton";
import { peso } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/error";
import { paymentLabels } from "../../../lib/order-status";
import type { Stats } from "../../../types/stats";

const statusOrder = ["pending", "processing", "shipped", "delivered", "cancelled"];

const shortDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5";

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-4">
            <Skeleton className="mb-3 h-4 w-1/2" />
            <Skeleton className="mb-2 h-7 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-white p-4">
        <Skeleton className="mb-4 h-5 w-1/4" />
        <Skeleton className="h-48 w-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white p-4">
            <Skeleton className="mb-4 h-5 w-1/3" />
            <Skeleton className="mb-3 h-4 w-full" />
            <Skeleton className="mb-3 h-4 w-5/6" />
            <Skeleton className="mb-3 h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminDashboardPage() {
  const [days, setDays] = useState<7 | 30>(7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getStats(days)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load dashboard"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  if (!stats) {
    return (
      <div>
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        {error ? (
          <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>
        ) : (
          <DashboardSkeleton />
        )}
      </div>
    );
  }

  const totalOrdersAll = Object.values(stats.statusCounts).reduce(
    (sum, n) => sum + n,
    0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="flex overflow-hidden rounded-md border border-brand bg-white text-sm">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`cursor-pointer px-4 py-1.5 ${
                days === d ? "bg-magenta font-bold text-white" : "text-magenta"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-red-100 px-3 py-2 text-red-800">{error}</p>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={peso(stats.totals.revenue)}
          sub={`Today: ${peso(stats.today.revenue)}`}
          icon={<Banknote size={20} />}
        />
        <StatCard
          label="Orders"
          value={stats.totals.orders}
          sub={`${stats.today.orders} today`}
          icon={<ShoppingCart size={20} />}
        />
        <StatCard
          label="Customers"
          value={stats.totals.customers}
          icon={<Users size={20} />}
        />
        <StatCard
          label="Products"
          value={stats.totals.products}
          sub={`${stats.totals.lowStock} low on stock`}
          icon={<Package size={20} />}
        />
      </div>

      {/* Sales chart */}
      <Panel
        title={`Sales, last ${stats.period.days} days`}
        action={
          <span className="text-sm text-neutral-500">
            {peso(stats.period.revenue)} from {stats.period.orders} orders
          </span>
        }
      >
        {stats.period.orders === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-500">
            No sales in this period yet.
          </p>
        ) : (
          <BarChart
            data={stats.daily.map((d) => ({
              label: shortDate(d.date),
              value: d.revenue,
              tooltip: `${shortDate(d.date)}: ${peso(d.revenue)} (${d.orders} orders)`,
            }))}
          />
        )}
      </Panel>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by status */}
        <Panel title="Orders by Status">
          <ul className="flex flex-col gap-3">
            {statusOrder.map((status) => {
              const count = stats.statusCounts[status] ?? 0;
              const percent = totalOrdersAll ? (count / totalOrdersAll) * 100 : 0;
              return (
                <li key={status} className="flex items-center gap-3">
                  <div className="w-24 flex-none">
                    <StatusBadge status={status} />
                  </div>
                  <div className="h-2 flex-1 rounded-full bg-neutral-200">
                    <div
                      className="h-2 rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 flex-none text-right text-sm font-bold">
                    {count}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* Top products */}
        <Panel title="Top Selling Products">
          <HBarList
            empty="No sales yet."
            items={stats.topProducts.map((p) => ({
              label: p.name,
              value: p.quantity,
              display: `${p.quantity} sold`,
            }))}
          />
        </Panel>

        {/* Category */}
        <Panel title="Sales by Category">
          <HBarList
            empty="No sales yet."
            items={stats.byCategory.map((c) => ({
              label: capitalize(c.category),
              value: c.revenue,
              display: peso(c.revenue),
            }))}
          />
        </Panel>

        {/* Payment */}
        <Panel title="Payment Methods">
          <HBarList
            empty="No sales yet."
            items={stats.byPayment.map((p) => ({
              label:
                (paymentLabels as Record<string, string>)[p.method] ?? p.method,
              value: p.count,
              display: `${p.count} orders`,
            }))}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent orders */}
        <div className="xl:col-span-2">
          <Panel
            title="Recent Orders"
            action={
              <Link to="/admin/orders" className="text-sm text-magenta underline">
                View all
              </Link>
            }
          >
            {stats.recentOrders.length === 0 ? (
              <p className="text-sm text-neutral-500">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr>
                      <th className={th}>Order #</th>
                      <th className={th}>Customer</th>
                      <th className={th}>Total</th>
                      <th className={th}>Status</th>
                      <th className={th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td className={`${td} font-bold`}>{o.id}</td>
                        <td className={td}>{o.customerName}</td>
                        <td className={td}>{peso(o.total)}</td>
                        <td className={td}>
                          <StatusBadge status={o.status} />
                        </td>
                        <td className={`${td} whitespace-nowrap`}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* Low stock */}
        <Panel
          title="Low Stock"
          action={
            <Link to="/admin/products" className="text-sm text-magenta underline">
              Manage
            </Link>
          }
        >
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-neutral-500">
              All products have enough stock.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {stats.lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.name}</p>
                    <p className="text-xs capitalize text-neutral-500">
                      {p.category}
                    </p>
                  </div>
                  <span
                    className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      p.stock === 0
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {loading && (
        <p className="text-center text-xs text-neutral-500">Updating...</p>
      )}
    </div>
  );
}

export default AdminDashboardPage;