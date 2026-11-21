import { useEffect, useState } from "react";
import { getReports, updateReport, type Report } from "../../../services/report-service";
import { TableSkeleton } from "../../../components/common/skeleton";
import { getErrorMessage } from "../../../lib/error";

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5 align-top";
const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

const badge: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-green-100 text-green-800",
  dismissed: "bg-neutral-200 text-neutral-700",
};

function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getReports()
      .then(setReports)
      .catch((err) => setError(getErrorMessage(err, "Failed to load reports")))
      .finally(() => setLoading(false));
  }, []);

  const handle = async (id: number, status: "reviewed" | "dismissed") => {
    setError("");
    try {
      const updated = await updateReport(id, status);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: updated.status } : r))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const shown =
    filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Reported Items</h1>
        <select
          className={field}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : shown.length === 0 ? (
        <p>No reports.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead>
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Reported by</th>
                <th className={th}>Reason</th>
                <th className={th}>Status</th>
                <th className={th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  <td className={td}>
                    <b>{r.productName}</b>
                    <br />
                    <small>{new Date(r.createdAt).toLocaleString()}</small>
                  </td>
                  <td className={td}>
                    {r.reporterName ?? "Deleted user"}
                    <br />
                    <small>{r.reporterEmail}</small>
                  </td>
                  <td className={td}>
                    {r.reason}
                    {r.details && (
                      <>
                        <br />
                        <small className="text-neutral-500">{r.details}</small>
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
                  </td>
                  <td className={td}>
                    {r.status === "open" ? (
                      <div className="flex flex-col gap-1">
                        <button
                          className="cursor-pointer rounded-md bg-green-600 px-2 py-1 text-xs text-white"
                          onClick={() => handle(r.id, "reviewed")}
                        >
                          Mark Reviewed
                        </button>
                        <button
                          className="cursor-pointer rounded-md bg-neutral-500 px-2 py-1 text-xs text-white"
                          onClick={() => handle(r.id, "dismissed")}
                        >
                          Dismiss
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

export default AdminReportsPage;