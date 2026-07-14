import {
  HiOutlineDocumentMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineExclamationTriangle,
  HiOutlineChartBar,
} from 'react-icons/hi2';
import ScoreBadge from '../review/ScoreBadge';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Total Reviews',
      value: stats?.totalReviews ?? 0,
      icon: HiOutlineDocumentMagnifyingGlass,
      color: 'var(--color-accent)',
      bgColor: 'var(--color-accent-muted)',
    },
    {
      label: 'Average Score',
      value: stats?.averageScore ? `${stats.averageScore}/100` : 'N/A',
      icon: HiOutlineChartBar,
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-muted)',
    },
    {
      label: 'Issues Found',
      value: stats?.totalIssues ?? 0,
      icon: HiOutlineExclamationTriangle,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-muted)',
    },
    {
      label: 'Clean Passes',
      value: stats?.cleanPasses ?? 0,
      icon: HiOutlineShieldCheck,
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-muted)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-xl p-5 border transition-all duration-300 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:-translate-y-0.5 hover:shadow-md animate-fade-in"
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {card.label}
                </p>
                <p className="mt-2 text-2xl font-bold text-white">
                  {card.value}
                </p>
              </div>
              {card.label === 'Average Score' && stats?.averageScore ? (
                <ScoreBadge score={stats.averageScore} size={48} />
              ) : (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: card.bgColor }}
                >
                  <Icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
