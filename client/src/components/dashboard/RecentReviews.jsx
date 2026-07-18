import { Link } from 'react-router-dom';
import { HiOutlineCodeBracket, HiOutlineChevronRight } from 'react-icons/hi2';

export default function RecentReviews({ reviews = [] }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'var(--color-success-muted)';
    if (score >= 50) return 'var(--color-warning-muted)';
    return 'var(--color-error-muted)';
  };

  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border overflow-hidden bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm">
      <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Recent Reviews</h3>
        <Link
          to="/history"
          className="text-xs font-semibold hover:underline flex items-center gap-1"
          style={{ color: 'var(--color-accent-hover)' }}
        >
          View All History
          <HiOutlineChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] bg-[var(--color-bg-secondary)]"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <th className="py-3 px-5">Context</th>
              <th className="py-3 px-5">Type</th>
              <th className="py-3 px-5">Score</th>
              <th className="py-3 px-5">Language</th>
              <th className="py-3 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody
            className="divide-y text-sm text-[var(--color-text-secondary)]"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {reviews.map((review) => {
              const score = review.overallScore;
              return (
                <tr
                  key={review.id}
                  className="hover:bg-[var(--color-surface-hover)] transition-colors duration-150"
                >
                  <td className="py-3.5 px-5 font-semibold text-[var(--color-text)]">
                    <div className="flex flex-col">
                      <span className="truncate max-w-[150px] sm:max-w-xs text-sm font-bold">
                        {review.project?.projectName || 'Snippet'}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] font-normal mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className="capitalize text-xs px-2.5 py-1 rounded-lg border font-semibold text-[var(--color-text)]"
                      style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {review.reviewType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    {score !== null ? (
                      <span
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl font-black text-sm border"
                        style={{
                          backgroundColor: getScoreBg(score),
                          color: getScoreColor(score),
                          borderColor: `${getScoreColor(score)}40`,
                        }}
                      >
                        {score}
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)]">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5 capitalize font-semibold text-[var(--color-text)]">
                      <HiOutlineCodeBracket className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
                      {review.language || 'Unknown'}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <Link
                      to={`/review/${review.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-text)] bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200"
                    >
                      Report
                      <HiOutlineChevronRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
