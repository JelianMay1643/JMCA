import { useEffect, useState, type FormEvent } from "react";
import {
  createTicket,
  getMyTickets,
  type Ticket,
} from "../../../services/support-service";
import { CardListSkeleton } from "../../../components/common/skeleton";
import { getErrorMessage } from "../../../lib/error";
import { btnSmall } from "../../../lib/styles";

const field =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 placeholder:text-neutral-400";

const badge: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-800",
  answered: "bg-green-100 text-green-800",
  closed: "bg-neutral-200 text-neutral-700",
};

function AccountSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () =>
    getMyTickets()
      .then(setTickets)
      .catch((err) => setError(getErrorMessage(err, "Failed to load tickets")))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSending(true);
    try {
      await createTicket(subject.trim(), message.trim());
      setSubject("");
      setMessage("");
      setSuccess("Na-send na ang imong message. Maghulat sa reply sa admin.");
      await load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Customer Support</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-4 text-neutral-800 shadow-sm"
      >
        <input
          className={field}
          placeholder="Subject"
          maxLength={100}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <textarea
          className={field}
          rows={4}
          maxLength={1000}
          placeholder="Describe your concern..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        {error && (
          <p className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">
            {success}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={sending}
            className={`${btnSmall} disabled:opacity-50`}
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>

      <h2 className="mb-2 text-lg font-bold">My Tickets</h2>

      {loading ? (
        <CardListSkeleton count={3} />
      ) : tickets.length === 0 ? (
        <p>You don't have a ticket yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-lg bg-white p-4 text-neutral-800 shadow-sm"
            >
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{t.subject}</p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-bold capitalize ${
                    badge[t.status] ?? ""
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="mb-2 text-xs text-neutral-500">
                {new Date(t.createdAt).toLocaleString()}
              </p>
              <p className="whitespace-pre-wrap text-sm">{t.message}</p>

              {t.adminReply && (
                <div className="mt-3 rounded-md bg-[#f7e9f3] p-3 text-sm">
                  <p className="mb-1 text-xs font-bold text-magenta">
                    Reply from JMCA
                    {t.repliedAt &&
                      ` · ${new Date(t.repliedAt).toLocaleString()}`}
                  </p>
                  <p className="whitespace-pre-wrap">{t.adminReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AccountSupportPage;