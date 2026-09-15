import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { History as HistoryIcon } from "lucide-react";
import { getAnalysisHistory } from "../api/analysis";
import { getErrorMessage } from "../api/client";
import SeverityBadge from "../components/SeverityBadge";
import Loader from "../components/Loader";

export default function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalysisHistory()
      .then(setItems)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">History</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Every file you've submitted for diagnosis.</p>

      <div className="mt-8 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)]">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader label="Loading history" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <HistoryIcon size={28} className="text-[var(--color-text-faint)]" />
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">No analyses yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-xs font-mono uppercase tracking-wide text-[var(--color-text-faint)]">
                <th className="px-5 py-3 font-medium">File</th>
                <th className="px-5 py-3 font-medium">Error type</th>
                <th className="px-5 py-3 font-medium">Severity</th>
                <th className="px-5 py-3 font-medium">Confidence</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-[var(--color-panel-raised)]">
                  <td className="px-5 py-3">
                    <Link to={`/analysis/${a.id}`} className="font-mono text-[var(--color-text)] hover:text-[var(--color-signal)]">
                      {a.filename}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">{a.error_type || "—"}</td>
                  <td className="px-5 py-3">{a.severity ? <SeverityBadge severity={a.severity} /> : <span className="font-mono text-xs uppercase text-[var(--color-text-faint)]">{a.status}</span>}</td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">
                    {a.confidence_score != null ? `${Math.round(a.confidence_score * 100)}%` : "—"}
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-faint)]">{new Date(a.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
