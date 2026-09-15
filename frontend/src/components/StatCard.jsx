export default function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-faint)]">{label}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[var(--color-text)]">{value}</p>
          {hint && <p className="mt-1 text-xs text-[var(--color-text-muted)]">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-[var(--color-signal-soft)] p-2">
            <Icon size={18} className="text-[var(--color-signal)]" />
          </div>
        )}
      </div>
    </div>
  );
}
