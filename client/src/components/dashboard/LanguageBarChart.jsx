import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BAR_COLOR_GRADIENTS = [
  { id: 'grad-js', color1: '#f59e0b', color2: '#fbbf24' },     // Javascript / Yellow Gold
  { id: 'grad-py', color1: '#3b82f6', color2: '#60a5fa' },     // Python / Blue
  { id: 'grad-ts', color1: '#6366f1', color2: '#818cf8' },     // Typescript / Indigo
  { id: 'grad-cpp', color1: '#ec4899', color2: '#f472b6' },    // C++ / Pink
  { id: 'grad-go', color1: '#10b981', color2: '#34d399' },     // Go / Emerald
  { id: 'grad-java', color1: '#f97316', color2: '#fb923c' },   // Java / Orange
];

export default function LanguageBarChart({ breakdown = [] }) {
  const totalScans = breakdown.reduce((sum, item) => sum + (item.count || 0), 0);

  const data = breakdown.map((d, index) => ({
    name: d.language.charAt(0).toUpperCase() + d.language.slice(1),
    count: d.count,
    percentage: totalScans ? Math.round((d.count / totalScans) * 100) : 0,
    gradientId: BAR_COLOR_GRADIENTS[index % BAR_COLOR_GRADIENTS.length].id,
    color1: BAR_COLOR_GRADIENTS[index % BAR_COLOR_GRADIENTS.length].color1,
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 glass">
        <p className="text-sm font-bold text-[var(--color-text)]">No language metrics yet</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center max-w-xs">
          Submit code in JS, Python, TS, Java, or C++ to generate multi-language distribution data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 glass border-[var(--color-border)] shadow-sm space-y-4 bg-[var(--color-surface)]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--color-text)] uppercase tracking-wider">Language Distribution</h3>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Total code reviews grouped by programming language
          </p>
        </div>
        <span className="badge badge-accent">{data.length} Language{data.length !== 1 ? 's' : ''}</span>
      </div>

      <ResponsiveContainer width="100%" height={170}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            {BAR_COLOR_GRADIENTS.map((g) => (
              <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={g.color2} stopOpacity={1} />
                <stop offset="100%" stopColor={g.color1} stopOpacity={0.8} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.4} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-border)"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-border)"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="p-3 rounded-xl border shadow-xl space-y-1 bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                    <p className="text-xs font-bold text-[var(--color-text)] flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color1 }} />
                      {item.name}
                    </p>
                    <p className="text-sm font-extrabold text-[var(--color-text)]">
                      {item.count} review{item.count !== 1 ? 's' : ''} ({item.percentage}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" name="Reviews" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#${entry.gradientId})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Language Breakdown Pills */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--color-border)]">
        {data.map((lang) => (
          <div
            key={lang.name}
            className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs border"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderColor: 'var(--color-border)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: lang.color1 }} />
            <span className="font-bold text-[var(--color-text)]">{lang.name}</span>
            <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
