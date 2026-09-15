import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileStack, Activity, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { getDashboardStats } from "../api/analysis";
import { getErrorMessage } from "../api/client";
import StatCard from "../components/StatCard";
import SeverityBadge from "../components/SeverityBadge";
import Loader from "../components/Loader";

const SEVERITY_COLORS = {
  critical: "#ff5d5d",
  high: "#ff9f5d",
  medium: "#ffb454",
  low: "#5da9ff",
  unknown: "#565f78",
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader label="Loading dashboard" />
      </div>
    );
  }

  const severityData = Object.entries(stats?.severity_breakdown || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Your bug diagnosis activity at a glance.</p>
        </div>
        <Link
          to="/upload"
          className="rounded-lg bg-[var(--color-signal)] px-4 py-2.5 text-sm font-medium text-[var(--color-base)] hover:opacity-90"
        >
          New diagnosis
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total analyses" value={stats?.total_analyses ?? 0} icon={Activity} />
        <StatCard label="Uploaded files" value={stats?.total_uploaded_files ?? 0} icon={FileStack} />
        <StatCard label="This week" value={stats?.analyses_this_week ?? 0} icon={Clock} />
        <StatCard
          label="Bug types found"
          value={Object.keys(stats?.bug_type_breakdown || {}).length}
          icon={AlertTriangle}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 lg:col-span-2">
          <h3 className="font-mono text-sm font-semibold text-[var(--color-text)]">Severity breakdown</h3>
          {severityData.length === 0 ? (
            <p className="mt-8 text-center text-sm text-[var(--color-text-faint)]">No completed analyses yet.</p>
          ) : (
            <div className="mt-2 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || SEVERITY_COLORS.unknown} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-panel-raised)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
                <span className="h-2 w-2 rounded-full" style={{ background: SEVERITY_COLORS[s.name] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-mono text-sm font-semibold text-[var(--color-text)]">Recent analyses</h3>
            <Link to="/history" className="text-xs text-[var(--color-signal)] hover:underline">
              View all
            </Link>
          </div>
          {stats?.recent_analyses?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-sm text-[var(--color-text-muted)]">No analyses yet.</p>
              <Link to="/upload" className="mt-2 text-sm text-[var(--color-signal)] hover:underline">
                Upload something to diagnose
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)]">
              {stats?.recent_analyses?.map((a) => (
                <Link
                  key={a.id}
                  to={`/analysis/${a.id}`}
                  className="flex items-center justify-between py-3 hover:opacity-80"
                >
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-[var(--color-text)]">{a.filename}</p>
                    <p className="text-xs text-[var(--color-text-faint)]">
                      {a.error_type || "Analyzing..."} · {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  {a.severity ? <SeverityBadge severity={a.severity} /> : (
                    <span className="text-xs font-mono uppercase text-[var(--color-text-faint)]">{a.status}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
