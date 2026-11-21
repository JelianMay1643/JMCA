import { useEffect, useState } from "react";
import {
  decideRefund,
  getRefunds,
  type Refund,
} from "../../../services/refund-service";
import { TableSkeleton } from "../../../components/common/skeleton";
import { peso } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/error";

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5 align-top";
const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

const badge: Record<string, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  refunded: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getRefunds()
      .then(setRefunds)
      .catch((err) => setError(getErrorMessage(err, "Failed to load refunds")))
      .finally(() => setLoading(false));
  }, []);

  const handleDecide = async (
    r: Refund,
    status: "refunded" | "rejected"
  ) => {
    const verb = status === "refunded" ? "mark as refunded" : "reject";
    const note = window.prompt(`Note (optional) para sa ${verb}:`);
    if (note === null) return;

    setError("");
    try {
      const updated = await decideRefund(r.id, status, note);
      setRefunds((prev) =>
        prev.map((x) => (x.id === r.id ? { ...x, ...updated } : x))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const shown =
    filter === "all" ? refunds : refunds.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Refunds</h1>
        <select
          className={field}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="requested">Requested</option>
          <option value="refunded">Refunded</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={7} />
      ) : shown.length === 0 ? (
        <p>No refunds.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead>
              <tr>
                <th className={th}>Order #</th>
                <th className={th}>Customer</th>
                <th className={th}>Send to</th>
                <th className={th}>Amount</th>
                <th className={th}>Reason</th>
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={td}>
                    <b>{r.orderId}</b>
                    <br />
                    <small>{new Date(r.requestedAt).toLocaleString()}</small>
                  </td>
                  <td className={td}>
                    {r.customerName}
                    <br />
                    <small>{r.email}</small>
                  </td>
                  <td className={td}>
                    <b>{r.paymentProvider}</b>
                    <br />
                    {r.paymentNumber}
                  </td>
                  <td className={`${td} font-bold`}>{peso(r.amount)}</td>
                  <td className={td}>
                    {r.reason || "-"}
                    {r.adminNote && (
                      <>
                        <br />
                        <small className="text-neutral-500">
                          Admin: {r.adminNote}
                        </small>
                      </>
                    )}
                  </td>
                  <td className={td}>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${
                        badge[r.status] ?? ""
                      }`}
                    >
                      {r.status}
                    </span>
                    {r.processedAt && (
                      <>
                        <br />
                        <small>
                          {new Date(r.processedAt).toLocaleString()}
                        </small>
                      </>
                    )}
                  </td>
                  <td className={td}>
                    {r.status === "requested" ? (
                      <div className="flex flex-col gap-1">
                        <button
                          className="cursor-pointer rounded-md bg-green-600 px-2 py-1 text-xs text-white"
                          onClick={() => handleDecide(r, "refunded")}
                        >
                          Mark Refunded
                        </button>
                        <button
                          className="cursor-pointer rounded-md bg-red-600 px-2 py-1 text-xs text-white"
                          onClick={() => handleDecide(r, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminRefundsPage;