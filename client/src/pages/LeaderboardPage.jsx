import { useQuery } from '@tanstack/react-query';
import { getLeaderboardAPI } from '../api/leaderboard';
import { HiOutlineTrophy, HiOutlineSparkles, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboardAPI(10),
  });

  const rankings = data?.data?.leaderboard || [];

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl">🥇</span>;
    if (rank === 2) return <span className="text-xl">🥈</span>;
    if (rank === 3) return <span className="text-xl">🥉</span>;
    return <span className="text-xs font-bold text-[var(--color-text-muted)] w-6 text-center">{rank}</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineTrophy className="text-amber-500" />
            Code Quality Leaderboard
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Top developers ranked by average code quality scores. Minimum 3 reviews required.
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-[var(--color-surface-hover)] rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rankings.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-[var(--color-border)] bg-[rgba(30,41,59,0.1)] space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500">
            <HiOutlineTrophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Leaderboard is empty</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
              No developers have reached the minimum requirement of 3 reviews yet. Submit reviews to see rankings!
            </p>
          </div>
        </div>
      )}

      {/* Rankings List */}
      {!isLoading && rankings.length > 0 && (
        <div className="rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden shadow-sm">
          <div className="p-6 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Standing Standings</span>
            <span className="text-[10px] text-[var(--color-text-muted)]">Updated hourly</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {rankings.map((user) => {
              const initials = user.name ? user.name[0].toUpperCase() : 'U';
              return (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-hover)] transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex justify-center items-center w-8">
                      {getRankBadge(user.rank)}
                    </div>

                    {/* Profile avatar & details */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold text-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-none">{user.name}</h4>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">{user.reviewCount} Reviews analyzed</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Improvement Delta */}
                    {user.improvement > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <HiOutlineArrowTrendingUp className="w-3 h-3" />
                        +{user.improvement} Delta
                      </div>
                    )}

                    {/* Avg Score */}
                    <div className="text-right">
                      <span className="text-sm font-black text-white">{user.averageScore}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)] ml-0.5">/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
