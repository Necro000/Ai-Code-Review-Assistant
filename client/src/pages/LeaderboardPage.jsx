import { useQuery } from '@tanstack/react-query';
import { getLeaderboardAPI } from '../api/leaderboard';
import { HiOutlineTrophy, HiOutlineArrowTrendingUp } from 'react-icons/hi2';

export default function LeaderboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => getLeaderboardAPI(10),
  });

  const rankings = data?.data?.leaderboard || [];

  const getRankStyle = (rank) => {
    if (rank === 1) return 'rank-gold';
    if (rank === 2) return 'rank-silver';
    if (rank === 3) return 'rank-bronze';
    return '';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return <span className="text-xl" title="Gold">🥇</span>;
    if (rank === 2) return <span className="text-xl" title="Silver">🥈</span>;
    if (rank === 3) return <span className="text-xl" title="Bronze">🥉</span>;
    return (
      <span
        className="text-xs font-bold w-6 text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        #{rank}
      </span>
    );
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #fde68a)', boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' }}
            >
              <HiOutlineTrophy className="w-5 h-5 text-white" />
            </span>
            Code Quality Leaderboard
          </h1>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Top developers ranked by average code quality score. Minimum 3 reviews required.
          </p>
        </div>
        <span className="badge badge-accent hidden sm:inline-flex">Updated hourly</span>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 skeleton rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && rankings.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed space-y-4"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(26, 37, 64, 0.3)' }}
        >
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl animate-float"
            style={{ background: 'linear-gradient(135deg, #f59e0b20, #fde68a20)', border: '1px solid #f59e0b30' }}
          >
            <HiOutlineTrophy className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Leaderboard is empty</h3>
            <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              No developers have reached the minimum of 3 reviews yet. Start submitting reviews to appear here!
            </p>
          </div>
        </div>
      )}

      {/* Rankings List */}
      {!isLoading && rankings.length > 0 && (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          {/* Table header */}
          <div
            className="px-6 py-3.5 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-white uppercase tracking-widest">Current Standings</span>
              <span className="badge badge-accent">{rankings.length} Developers</span>
            </div>
            <span className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Avg Score / 100</span>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {rankings.map((user, index) => {
              const initials = user.name ? user.name[0].toUpperCase() : 'U';
              const scoreColor = getScoreColor(user.averageScore);
              const barWidth = Math.min(100, user.averageScore);

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between px-5 py-4 hover:bg-[var(--color-surface-hover)] transition-colors ${getRankStyle(user.rank)}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Left: Rank + Avatar + Name */}
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex justify-center items-center w-8 flex-shrink-0">
                      {getRankBadge(user.rank)}
                    </div>

                    {/* Avatar */}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold text-white flex-shrink-0"
                      style={{ background: 'var(--gradient-brand)' }}
                    >
                      {initials}
                    </div>

                    {/* Name + Reviews */}
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none">{user.name}</h4>
                      <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        {user.reviewCount} review{user.reviewCount !== 1 ? 's' : ''} analyzed
                      </p>
                    </div>
                  </div>

                  {/* Right: Score + Progress + Delta */}
                  <div className="flex items-center gap-5">
                    {/* Improvement Delta */}
                    {user.improvement > 0 && (
                      <div
                        className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: 'var(--color-success)',
                          backgroundColor: 'var(--color-success-muted)',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        <HiOutlineArrowTrendingUp className="w-3 h-3" />
                        +{user.improvement}
                      </div>
                    )}

                    {/* Score + Progress bar */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:block w-24">
                        <div className="progress-bar-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${barWidth}%`,
                              background: `linear-gradient(90deg, ${scoreColor}99, ${scoreColor})`,
                              boxShadow: `0 0 6px ${scoreColor}60`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black" style={{ color: scoreColor }}>
                          {user.averageScore}
                        </span>
                        <span className="text-[10px] ml-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          /100
                        </span>
                      </div>
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
