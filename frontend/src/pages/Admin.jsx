import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Users, Activity, FileStack } from "lucide-react";
import { getAdminStats } from "../api/admin";
import { getErrorMessage } from "../api/client";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader label="Loading admin stats" />
      </div>
    );
  }

  const bugTypeData = Object.entries(stats?.popular_bug_types || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return (
    <div>
      <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">Platform-wide activity across all users.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={stats?.total_users ?? 0} icon={Users} />
        <StatCard label="Total analyses" value={stats?.total_analyses ?? 0} icon={Activity} />
        <StatCard label="Documents ingested" value={stats?.total_documents ?? 0} icon={FileStack} />
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h3 className="font-mono text-sm font-semibold text-[var(--color-text)]">Most common bug types</h3>
        {bugTypeData.length === 0 ? (
          <p className="mt-6 text-center text-sm text-[var(--color-text-faint)]">No completed analyses yet.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bugTypeData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" stroke="var(--color-text-faint)" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="var(--color-text-faint)" fontSize={11} width={140} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-panel-raised)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-signal)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h3 className="font-mono text-sm font-semibold text-[var(--color-text)]">Analyses by status</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(stats?.analyses_by_status || {}).map(([status, count]) => (
            <div key={status} className="rounded-lg border border-[var(--color-border)] px-4 py-2">
              <p className="font-mono text-xs uppercase text-[var(--color-text-faint)]">{status}</p>
              <p className="font-mono text-lg text-[var(--color-text)]">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
