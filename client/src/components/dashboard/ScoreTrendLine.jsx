import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineMinus } from 'react-icons/hi2';

export default function ScoreTrendLine({ trend = [] }) {
  const data = trend
    .filter((d) => d.overallScore !== null)
    .map((d) => ({
      date: new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.round(d.overallScore),
    }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 glass">
        <p className="text-sm font-semibold text-white">No score trend yet</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1 text-center max-w-xs">
          Analyze code snippets to track your quality score progression over time.
        </p>
      </div>
    );
  }

  // Calculate score trend trajectory
  const firstScore = data[0]?.score || 0;
  const latestScore = data[data.length - 1]?.score || 0;
  const scoreDiff = latestScore - firstScore;

  return (
    <div className="rounded-2xl border p-6 glass border-[var(--color-border)] shadow-md space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            Quality Score Trend
          </h3>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            Chronological progression of average review scores
          </p>
        </div>

        {/* Trajectory Badge */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
          style={{
            color: scoreDiff > 0 ? '#22c55e' : scoreDiff < 0 ? '#ef4444' : '#94a3b8',
            backgroundColor: scoreDiff > 0 ? 'rgba(34,197,94,0.12)' : scoreDiff < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)',
            borderColor: scoreDiff > 0 ? 'rgba(34,197,94,0.3)' : scoreDiff < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(148,163,184,0.3)',
          }}
        >
          {scoreDiff > 0 ? (
            <>
              <HiOutlineArrowTrendingUp className="w-3.5 h-3.5" />
              <span>+{scoreDiff} pts</span>
            </>
          ) : scoreDiff < 0 ? (
            <>
              <HiOutlineArrowTrendingDown className="w-3.5 h-3.5" />
              <span>{scoreDiff} pts</span>
            </>
          ) : (
            <>
              <HiOutlineMinus className="w-3.5 h-3.5" />
              <span>Stable</span>
            </>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-border)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-border)"
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const val = payload[0].value;
                const color = val >= 80 ? '#22c55e' : val >= 60 ? '#f59e0b' : '#ef4444';
                return (
                  <div className="p-3 rounded-xl border glass shadow-2xl space-y-1 bg-[var(--color-bg-secondary)] border-[var(--color-border)]">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                      {label}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">Score:</span>
                      <span className="text-sm font-black" style={{ color }}>
                        {val}/100
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="Score"
            stroke="#818cf8"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#scoreAreaGradient)"
            dot={{ r: 4, stroke: '#6366f1', strokeWidth: 2, fill: '#0e1525' }}
            activeDot={{ r: 7, stroke: '#a78bfa', strokeWidth: 3, fill: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
