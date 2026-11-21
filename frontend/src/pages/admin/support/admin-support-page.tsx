import { useEffect, useState } from "react";
import {
  closeTicket,
  getAllTickets,
  replyTicket,
  type AdminTicket,
} from "../../../services/support-service";
import { CardListSkeleton } from "../../../components/common/skeleton";
import { getErrorMessage } from "../../../lib/error";
import { btnSmall } from "../../../lib/styles";

const field = "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm";

const badge: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-neutral-200 text-neutral-700",
};

function AdminSupportPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    getAllTickets()
      .then(setTickets)
      .catch((err) => setError(getErrorMessage(err, "Failed to load tickets")))
      .finally(() => setLoading(false));
  }, []);

  const patch = (id: number, data: Partial<AdminTicket>) =>
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

  const handleReply = async (id: number) => {
    const text = (drafts[id] ?? "").trim();
    if (!text) return;
    setError("");
    try {
      const updated = await replyTicket(id, text);
      patch(id, {
        status: updated.status,
        adminReply: updated.adminReply,
        repliedAt: updated.repliedAt,
      });
      setDrafts((d) => ({ ...d, [id]: "" }));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleClose = async (id: number) => {
    setError("");
    try {
      const updated = await closeTicket(id);
      patch(id, { status: updated.status });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const shown =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Customer Support</h1>
        <select
          className={field}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="answered">Answered</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-red-800">
          {error}
        </p>
      )}

      {loading ? (
        <CardListSkeleton count={3} />
      ) : shown.length === 0 ? (
        <p>No tickets.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {shown.map((t) => (
            <div key={t.id} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold">{t.subject}</p>
                  <p className="text-xs text-neutral-500">
                    {t.customerName ?? "Deleted user"}
                    {t.customerEmail && ` (${t.customerEmail})`} ·{" "}
                    {new Date(t.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${
                    badge[t.status] ?? ""
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="mb-3 whitespace-pre-wrap text-sm">{t.message}</p>

              {t.adminReply && (
                <div className="mb-3 rounded-md bg-[#f7e9f3] p-3 text-sm">
                  <p className="mb-1 text-xs font-bold text-magenta">
                    Your reply
                    {t.repliedAt &&
                      ` · ${new Date(t.repliedAt).toLocaleString()}`}
                  </p>
                  <p className="whitespace-pre-wrap">{t.adminReply}</p>
                </div>
              )}

              {t.status !== "closed" && (
                <div className="flex flex-col gap-2">
                  <textarea
                    className={field}
                    rows={2}
                    maxLength={1000}
                    placeholder={
                      t.adminReply ? "Update your reply..." : "Write a reply..."
                    }
                    value={drafts[t.id] ?? ""}
                    onChange={(e) =>
                      setDrafts((d) => ({ ...d, [t.id]: e.target.value }))
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      className={btnSmall}
                      onClick={() => handleReply(t.id)}
                    >
                      Send Reply
                    </button>
                    <button
                      className="cursor-pointer rounded-md bg-neutral-500 px-3 py-1.5 text-sm text-white"
                      onClick={() => handleClose(t.id)}
                    >
                      Close Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminSupportPage;