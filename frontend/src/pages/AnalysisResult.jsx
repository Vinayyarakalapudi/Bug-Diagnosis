import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { CheckCircle2, MessageSquareText, FileCode2, Lightbulb, ListChecks, Shuffle } from "lucide-react";
import { getAnalysis } from "../api/analysis";
import { getErrorMessage } from "../api/client";
import SeverityBadge from "../components/SeverityBadge";
import Loader from "../components/Loader";

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-[var(--color-signal)]" />
        <h3 className="font-mono text-sm font-semibold text-[var(--color-text)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AnalysisResult() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalysis(id)
      .then(setAnalysis)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader label="Loading analysis" />
      </div>
    );
  }

  if (!analysis) {
    return <p className="text-sm text-[var(--color-text-muted)]">Analysis not found.</p>;
  }

  const confidencePct = Math.round((analysis.confidence_score || 0) * 100);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">
            {analysis.file_type} · {new Date(analysis.created_at).toLocaleString()}
          </p>
          <h1 className="mt-1 font-mono text-xl font-semibold text-[var(--color-text)]">{analysis.filename}</h1>
        </div>
        <div className="flex items-center gap-3">
          {analysis.severity && <SeverityBadge severity={analysis.severity} />}
          <Link
            to={`/chat?analysis_id=${analysis.id}`}
            className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-panel-raised)]"
          >
            <MessageSquareText size={15} /> Ask about this
          </Link>
        </div>
      </div>

      {analysis.status !== "completed" ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center">
          <p className="font-mono text-sm text-[var(--color-text)]">Status: {analysis.status}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Section icon={CheckCircle2} title="Root cause">
              <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{analysis.root_cause}</p>
              {analysis.explanation && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{analysis.explanation}</p>
              )}
            </Section>

            <Section icon={ListChecks} title="Step-by-step fix">
              <ol className="space-y-2">
                {analysis.step_by_step_fix?.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-[var(--color-text-muted)]">
                    <span className="font-mono text-xs text-[var(--color-signal)]">{String(i + 1).padStart(2, "0")}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </Section>

            {analysis.improved_code && (
              <Section icon={FileCode2} title="Improved code">
                <pre className="overflow-x-auto rounded-lg bg-[var(--color-base)] p-4 font-mono text-xs text-[var(--color-signal)]">
                  {analysis.improved_code}
                </pre>
              </Section>
            )}

            {analysis.alternative_solutions?.length > 0 && (
              <Section icon={Shuffle} title="Alternative solutions">
                <ul className="list-inside list-disc space-y-1.5">
                  {analysis.alternative_solutions.map((alt, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-muted)]">{alt}</li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
              <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Confidence</p>
              <div className="mt-2 flex items-end gap-2">
                <span className="font-mono text-3xl font-semibold text-[var(--color-signal)]">{confidencePct}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-panel-raised)]">
                <div className="h-full bg-[var(--color-signal)]" style={{ width: `${confidencePct}%` }} />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
              <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Error type</p>
              <p className="mt-1 font-mono text-sm text-[var(--color-text)]">{analysis.error_type}</p>

              <p className="mt-4 font-mono text-xs uppercase tracking-wide text-[var(--color-text-faint)]">Location</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{analysis.probable_file}</p>
              <p className="text-sm text-[var(--color-text-muted)]">{analysis.probable_function}()</p>
            </div>

            {analysis.possible_reasons?.length > 0 && (
              <Section icon={Lightbulb} title="Also worth checking">
                <ul className="list-inside list-disc space-y-1.5">
                  {analysis.possible_reasons.map((r, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-muted)]">{r}</li>
                  ))}
                </ul>
              </Section>
            )}

            {analysis.best_practices?.length > 0 && (
              <Section icon={CheckCircle2} title="Best practices">
                <ul className="list-inside list-disc space-y-1.5">
                  {analysis.best_practices.map((bp, i) => (
                    <li key={i} className="text-sm text-[var(--color-text-muted)]">{bp}</li>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
