import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ScoreTrendLine({ trend = [] }) {
  const data = trend
    .filter(d => d.overallScore !== null)
    .map(d => ({
      date: new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.round(d.overallScore)
    }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">No trend data yet. Analyze more files to view progress.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quality Score Trend</h3>
        <p className="text-[10px] text-[var(--color-text-muted)]">Chrological progression of average review scores</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} stroke="var(--color-border)" />
          <YAxis domain={[0, 100]} tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} stroke="var(--color-border)" />
          <Tooltip
            contentStyle={{
              background: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--color-text)'
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="var(--color-accent)"
            strokeWidth={3}
            dot={{ r: 4, stroke: 'var(--color-accent)', strokeWidth: 1, fill: 'var(--color-surface)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
