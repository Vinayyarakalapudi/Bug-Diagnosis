export default function Loader({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--color-signal)]"
            style={{
              animation: `node-glow 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="font-mono text-xs uppercase tracking-wider">{label}</p>
    </div>
  );
}
