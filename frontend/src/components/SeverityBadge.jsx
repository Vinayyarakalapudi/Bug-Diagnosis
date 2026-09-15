const STYLES = {
  critical: { bg: "var(--color-critical-soft)", fg: "var(--color-critical)" },
  high: { bg: "var(--color-high-soft)", fg: "var(--color-high)" },
  medium: { bg: "var(--color-medium-soft)", fg: "var(--color-medium)" },
  low: { bg: "var(--color-low-soft)", fg: "var(--color-low)" },
};

export default function SeverityBadge({ severity }) {
  const key = (severity || "medium").toLowerCase();
  const style = STYLES[key] || STYLES.medium;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-mono font-medium uppercase tracking-wide"
      style={{ backgroundColor: style.bg, color: style.fg }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.fg }} />
      {key}
    </span>
  );
}
