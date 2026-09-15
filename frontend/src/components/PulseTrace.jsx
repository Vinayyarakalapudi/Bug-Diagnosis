const STAGES = [
  { key: "detect", label: "Detect" },
  { key: "analyze", label: "Analyze" },
  { key: "retrieve", label: "Retrieve" },
  { key: "fix", label: "Fix" },
];

/**
 * activeIndex: -1 = idle/decorative, 0-3 = which stage is currently active,
 * 4 = all complete.
 */
export default function PulseTrace({ activeIndex = -1, size = "md" }) {
  const height = size === "lg" ? 90 : 56;
  const nodeXs = [40, 200, 360, 520];
  const width = 560;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <line
          x1="20" y1={height / 2} x2={width - 20} y2={height / 2}
          stroke="var(--color-border)" strokeWidth="2"
        />
        <polyline
          points={`20,${height / 2} 130,${height / 2} 160,${height / 2 - 16} 190,${height / 2 + 16} 220,${height / 2} 290,${height / 2} 320,${height / 2 - 20} 350,${height / 2 + 20} 380,${height / 2} ${width - 20},${height / 2}`}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pulse-line"
          opacity={activeIndex === -1 ? 0.5 : 1}
        />
        {nodeXs.map((x, i) => {
          const isActive = i === activeIndex;
          const isDone = activeIndex > i || activeIndex === 4;
          return (
            <g key={STAGES[i].key} className={isActive ? "node-active" : ""}>
              <circle
                cx={x} cy={height / 2} r={isActive ? 7 : 5.5}
                fill={isDone || isActive ? "var(--color-signal)" : "var(--color-panel-raised)"}
                stroke="var(--color-signal)"
                strokeWidth={isDone || isActive ? 0 : 1.5}
              />
              <text
                x={x} y={height / 2 + (size === "lg" ? 28 : 22)}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={size === "lg" ? 13 : 11}
                fill={isDone || isActive ? "var(--color-signal)" : "var(--color-text-faint)"}
                letterSpacing="0.05em"
              >
                {STAGES[i].label.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
