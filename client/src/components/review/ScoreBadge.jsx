import { useMemo } from 'react';

export default function ScoreBadge({ score = 0, size = 80 }) {
  const normalizedScore = Math.max(0, Math.min(100, score || 0));

  const grade = useMemo(() => {
    if (normalizedScore >= 90) return 'A';
    if (normalizedScore >= 80) return 'B';
    if (normalizedScore >= 70) return 'C';
    if (normalizedScore >= 60) return 'D';
    return 'F';
  }, [normalizedScore]);

  const colorClass = useMemo(() => {
    if (grade === 'A') return { text: 'text-[var(--color-accent)]', stroke: 'var(--color-accent)', glow: 'rgba(79, 70, 229, 0.25)' };
    if (grade === 'B') return { text: 'text-emerald-500', stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' };
    if (grade === 'C') return { text: 'text-amber-500', stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' };
    if (grade === 'D') return { text: 'text-orange-500', stroke: '#ea580c', glow: 'rgba(234, 88, 12, 0.25)' };
    return { text: 'text-rose-500', stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)' };
  }, [grade]);

  const radius = size * 0.4;
  const strokeWidth = size * 0.08;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
          className="opacity-20"
        />
        {/* Foreground Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={colorClass.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-in-out',
            filter: `drop-shadow(0 0 4px ${colorClass.glow})`
          }}
        />
      </svg>
      {/* Inner Label */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xs font-semibold uppercase text-[var(--color-text-muted)] tracking-wider" style={{ fontSize: size * 0.12 }}>
          Grade
        </span>
        <span className={`font-bold leading-none ${colorClass.text}`} style={{ fontSize: size * 0.32 }}>
          {grade}
        </span>
        <span className="text-xs font-medium text-[var(--color-text-secondary)] mt-0.5" style={{ fontSize: size * 0.15 }}>
          {normalizedScore}
        </span>
      </div>
    </div>
  );
}
