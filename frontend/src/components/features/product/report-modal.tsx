import { useState } from "react";
import type { Product } from "../../../types/product";
import { reportProduct, reportReasons } from "../../../services/report-service";
import { getErrorMessage } from "../../../lib/error";

function ReportModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null
  );
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reason) {
      setMessage({ ok: false, text: "Pili og rason" });
      return;
    }
    setSending(true);
    try {
      await reportProduct(product.id, reason, details);
      setMessage({ ok: true, text: "Na-send na ang report. Salamat!" });
    } catch (err) {
      setMessage({ ok: false, text: getErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-4 text-neutral-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Report: {product.name}</h2>
          <button onClick={onClose} className="cursor-pointer text-xl">
            ×
          </button>
        </div>

        <label className="mb-2 flex flex-col gap-1 text-sm">
          Rason
          <select
            className="rounded-md border border-neutral-300 p-2 text-sm"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="">Select reason</option>
            {reportReasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-3 flex flex-col gap-1 text-sm">
          Details (optional)
          <textarea
            className="rounded-md border border-neutral-300 p-2 text-sm"
            rows={3}
            maxLength={500}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </label>

        {message && (
          <p
            className={`mb-3 rounded-md px-3 py-2 text-sm ${
              message.ok
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={sending || message?.ok === true}
            className="cursor-pointer rounded-md bg-magenta px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {sending ? "Sending..." : "Submit Report"}
          </button>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportModal;