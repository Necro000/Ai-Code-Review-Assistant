import {
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import ScoreBadge from '../review/ScoreBadge';

export default function StatsCards({ stats }) {
  const avgScore = stats?.averageScore ?? 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const totalIssues = stats?.totalIssues ?? 0;
  const cleanPasses = stats?.cleanPasses ?? 0;

  const getScoreRating = (score) => {
    if (!score) return { label: 'No Data', color: 'var(--color-text-muted)', bg: 'rgba(100,116,139,0.1)' };
    if (score >= 85) return { label: 'Excellent', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
    if (score >= 70) return { label: 'Good Quality', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' };
    if (score >= 50) return { label: 'Needs Improvement', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
    return { label: 'Critical Issues', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  };

  const rating = getScoreRating(avgScore);

  const cards = [
    {
      label: 'Total Reviews',
      value: totalReviews,
      subtext: `${totalReviews} total snippet & file scans`,
      icon: HiOutlineDocumentMagnifyingGlass,
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)',
      borderColor: 'rgba(99, 102, 241, 0.25)',
      iconBg: 'rgba(99, 102, 241, 0.15)',
      iconColor: '#818cf8',
    },
    {
      label: 'Average Score',
      value: avgScore ? `${avgScore}/100` : 'N/A',
      subtext: rating.label,
      ratingPill: rating,
      icon: HiOutlineChartBar,
      gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      borderColor: 'rgba(34, 197, 94, 0.25)',
      iconBg: 'rgba(34, 197, 94, 0.15)',
      iconColor: '#4ade80',
      isScore: true,
    },
    {
      label: 'Issues Found',
      value: totalIssues,
      subtext: totalReviews ? `Avg ${(totalIssues / Math.max(1, totalReviews)).toFixed(1)} per review` : '0 per review',
      icon: HiOutlineExclamationTriangle,
      gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.25)',
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#fbbf24',
    },
    {
      label: 'Clean Passes',
      value: cleanPasses,
      subtext: totalReviews ? `${Math.round((cleanPasses / Math.max(1, totalReviews)) * 100)}% pass rate` : '0% pass rate',
      icon: HiOutlineShieldCheck,
      gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)',
      borderColor: 'rgba(59, 130, 246, 0.25)',
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#60a5fa',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 glass hover:-translate-y-1 group"
            style={{
              borderColor: card.borderColor,
              background: card.gradient,
              animationDelay: `${index * 80}ms`,
            }}
          >
            {/* Background subtle glow effect */}
            <div
              className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full pointer-events-none opacity-20 transition-opacity duration-300 group-hover:opacity-40"
              style={{ background: card.iconColor, filter: 'blur(20px)' }}
            />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {card.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {card.value}
                  </span>
                </div>
              </div>

              {card.isScore && avgScore ? (
                <div className="flex-shrink-0">
                  <ScoreBadge score={avgScore} size={48} />
                </div>
              ) : (
                <div
                  className="flex items-center justify-center w-11 h-11 rounded-xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm"
                  style={{
                    backgroundColor: card.iconBg,
                    border: `1px solid ${card.iconColor}30`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: card.iconColor }} />
                </div>
              )}
            </div>

            {/* Subtext / rating pill */}
            <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs relative z-10">
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                {card.subtext}
              </span>
              {card.ratingPill && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    color: card.ratingPill.color,
                    backgroundColor: card.ratingPill.bg,
                    borderColor: `${card.ratingPill.color}40`,
                  }}
                >
                  {card.ratingPill.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
