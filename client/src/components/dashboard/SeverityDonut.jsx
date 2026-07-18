import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SeverityDonut({ breakdown = {} }) {
  const errorCount = breakdown.error || 0;
  const warningCount = breakdown.warning || 0;
  const infoCount = breakdown.info || 0;

  const totalIssues = errorCount + warningCount + infoCount;

  const data = [
    { name: 'Errors', value: errorCount, color: 'var(--color-error)' },
    { name: 'Warnings', value: warningCount, color: 'var(--color-warning)' },
    { name: 'Info', value: infoCount, color: 'var(--color-info)' },
  ].filter((d) => d.value > 0);

  if (totalIssues === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 glass">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 mb-2 font-bold text-lg">
          ✓
        </div>
        <p className="text-sm font-bold text-[var(--color-text)]">No findings detected</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center max-w-xs">
          Great job! All analyzed code reviews have passed clean without errors or warnings.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 glass border-[var(--color-border)] shadow-sm space-y-4 bg-[var(--color-surface)]">
      <div>
        <h3 className="text-sm font-extrabold text-[var(--color-text)] uppercase tracking-wider">Findings Severity</h3>
        <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
          Distribution of errors, warnings and style rules
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Donut Chart with Center Text */}
        <div className="sm:col-span-2 relative flex items-center justify-center h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="transparent"
                cornerRadius={6}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const pct = Math.round((item.value / totalIssues) * 100);
                    return (
                      <div className="p-3 rounded-xl border shadow-xl space-y-1 bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                        <p className="text-xs font-bold text-[var(--color-text)] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                          {item.name}
                        </p>
                        <p className="text-sm font-extrabold text-[var(--color-text)]">
                          {item.value} issue{item.value !== 1 ? 's' : ''} ({pct}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Donut Hole Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-[var(--color-text)] leading-none">{totalIssues}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mt-1">
              Issues
            </span>
          </div>
        </div>

        {/* Custom Interactive Legend Side Pills */}
        <div className="sm:col-span-1 space-y-2">
          {[
            { label: 'Errors', count: errorCount, color: 'var(--color-error)', bg: 'var(--color-error-muted)' },
            { label: 'Warnings', count: warningCount, color: 'var(--color-warning)', bg: 'var(--color-warning-muted)' },
            { label: 'Info', count: infoCount, color: 'var(--color-info)', bg: 'var(--color-info-muted)' },
          ].map((item) => {
            const pct = totalIssues ? Math.round((item.count / totalIssues) * 100) : 0;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between p-2.5 rounded-xl border transition-all"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: item.color, boxShadow: `0 0 6px ${item.color}80` }}
                  />
                  <span className="text-xs font-semibold text-[var(--color-text)]">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-[var(--color-text)]">{item.count}</span>
                  <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
