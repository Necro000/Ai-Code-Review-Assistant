import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function SeverityDonut({ breakdown = {} }) {
  const data = [
    { name: 'Errors', value: breakdown.error || 0, color: 'var(--color-error)' },
    { name: 'Warnings', value: breakdown.warning || 0, color: 'var(--color-warning)' },
    { name: 'Info', value: breakdown.info || 0, color: 'var(--color-info)' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[240px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">No issues recorded. Your code is clean!</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Findings Severity</h3>
        <p className="text-[10px] text-[var(--color-text-muted)]">Distribution of errors, warnings and style rules</p>
      </div>
      <div className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                fontSize: 12,
                color: 'var(--color-text)'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 10, color: 'var(--color-text-secondary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
