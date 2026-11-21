import { useEffect, useState } from "react";
import { getAuditLogs, type AuditLog } from "../../../services/audit-service";
import { TableSkeleton } from "../../../components/common/skeleton";
import { getErrorMessage } from "../../../lib/error";
import { btnSmall } from "../../../lib/styles";

const th = "bg-blush p-2.5";
const td = "border-b border-neutral-200 p-2.5 align-top";
const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

const PER_PAGE = 15;
const entities = ["product", "order", "refund", "report", "support"];

function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [entity, setEntity] = useState("all");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getAuditLogs({
      page,
      limit: PER_PAGE,
      search: debouncedSearch,
      entity: entity === "all" ? undefined : entity,
    })
      .then((res) => {
        if (cancelled) return;
        setLogs(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setError("");
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load audit logs"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, entity]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Audit Logs</h1>

        <div className="flex flex-wrap items-center gap-2">
          <input
            className={field}
            placeholder="Search action, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className={field}
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            {entities.map((e) => (
              <option key={e} value={e} className="capitalize">
                {e}
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
        <TableSkeleton rows={10} cols={5} />
      ) : (
        <>
          <p className="mb-2 text-sm text-neutral-500">
            Showing {logs.length} of {total} logs
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white text-left text-sm">
              <thead>
                <tr>
                  <th className={th}>Date</th>
                  <th className={th}>Who</th>
                  <th className={th}>Action</th>
                  <th className={th}>Target</th>
                  <th className={th}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className={`${td} whitespace-nowrap`}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className={td}>{l.actorName || l.actorType}</td>
                    <td className={td}>
                      <span className="rounded-full bg-blush px-2 py-1 text-xs font-bold">
                        {l.action}
                      </span>
                    </td>
                    <td className={`${td} capitalize`}>
                      {l.entity}
                      {l.entityId && (
                        <small className="ml-1 text-neutral-500">
                          #{l.entityId}
                        </small>
                      )}
                    </td>
                    <td className={td}>{l.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <p className="bg-white p-4 text-center text-sm text-neutral-500">
                No logs found.
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              className={`${btnSmall} disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {page} of {totalPages}
            </span>
            <button
              className={`${btnSmall} disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminAuditPage;