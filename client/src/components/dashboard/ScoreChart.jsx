export default function ScoreChart({ trend = [] }) {
  const width = 500;
  const height = 180;
  const padding = 24;

  // Filter out reviews that do not have a score
  const data = trend.filter((d) => d.overallScore !== null);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[220px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-center p-4">
        <p className="text-sm text-[var(--color-text-muted)]">No sufficient scoring trend data yet.</p>
      </div>
    );
  }

  // Calculate points coordinate mapping
  const getX = (index) => {
    if (data.length <= 1) return width / 2;
    return padding + (index * (width - padding * 2)) / (data.length - 1);
  };

  const getY = (score) => {
    // invert Y since SVG 0,0 is top-left
    return height - padding - (score * (height - padding * 2)) / 100;
  };

  // Build the SVG path string
  let pathD = '';
  let areaD = '';

  if (data.length > 0) {
    const firstX = getX(0);
    const firstY = getY(data[0].overallScore);

    pathD = `M ${firstX} ${firstY}`;
    areaD = `M ${firstX} ${height - padding} L ${firstX} ${firstY}`;

    for (let i = 1; i < data.length; i++) {
      const x = getX(i);
      const y = getY(data[i].overallScore);
      pathD += ` L ${x} ${y}`;
      areaD += ` L ${x} ${y}`;
    }

    const lastX = getX(data.length - 1);
    areaD += ` L ${lastX} ${height - padding} Z`;
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-4 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 w-full"
    >
      <h3 className="text-sm font-semibold text-white">Score Performance History</h3>
      
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={padding}
            y1={getY(100)}
            x2={width - padding}
            y2={getY(100)}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            strokeWidth="0.5"
          />
          <line
            x1={padding}
            y1={getY(50)}
            x2={width - padding}
            y2={getY(50)}
            stroke="var(--color-border)"
            strokeDasharray="4 4"
            strokeWidth="0.5"
          />
          <line
            x1={padding}
            y1={getY(0)}
            x2={width - padding}
            y2={getY(0)}
            stroke="var(--color-border)"
            strokeWidth="0.5"
          />

          {/* Grid Labels */}
          <text x={padding - 5} y={getY(100) + 4} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
            100
          </text>
          <text x={padding - 5} y={getY(50) + 4} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
            50
          </text>
          <text x={padding - 5} y={getY(0) + 4} textAnchor="end" fontSize="9" fill="var(--color-text-muted)">
            0
          </text>

          {/* Area under the line */}
          {data.length > 1 && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Core line */}
          {data.length > 0 && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive dots */}
          {data.map((d, index) => {
            const cx = getX(index);
            const cy = getY(d.overallScore);
            return (
              <g key={d.id} className="group/dot cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  fill="var(--color-bg-primary)"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                  className="transition-all duration-200 group-hover/dot:r-7"
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="12"
                  fill="var(--color-accent)"
                  fillOpacity="0"
                  className="transition-all duration-200 group-hover/dot:fill-opacity-15"
                />
                {/* Score hover tooltip */}
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  className="opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 pointer-events-none"
                >
                  {d.overallScore}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
