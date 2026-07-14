import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  'var(--color-accent)',
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f97316', // Orange
];

export default function LanguageBarChart({ breakdown = [] }) {
  const data = breakdown.map(d => ({
    name: d.language.charAt(0).toUpperCase() + d.language.slice(1),
    count: d.count
  }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">No language metrics yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Language Distribution</h3>
        <p className="text-[10px] text-[var(--color-text-muted)]">Total code reviews grouped by programming language</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis dataKey="name" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} stroke="var(--color-border)" />
          <YAxis allowDecimals={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} stroke="var(--color-border)" />
          <Tooltip
            contentStyle={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--color-text)'
            }}
          />
          <Bar dataKey="count" name="Reviews" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
