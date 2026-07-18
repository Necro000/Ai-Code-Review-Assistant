import { Link } from 'react-router-dom';
import { HiOutlineCodeBracket, HiOutlineClock, HiOutlineTrash, HiOutlineChevronRight } from 'react-icons/hi2';

export default function ReviewCard({ review, onDelete }) {
  const score = review.overallScore;
  const findingsCount = review.findings?.length || 0;

  const getScoreColor = (s) => {
    if (s === null) return 'var(--color-text-muted)';
    if (s >= 80) return 'var(--color-success)';
    if (s >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreBg = (s) => {
    if (s === null) return 'var(--color-surface-hover)';
    if (s >= 80) return 'var(--color-success-muted)';
    if (s >= 50) return 'var(--color-warning-muted)';
    return 'var(--color-error-muted)';
  };

  return (
    <div
      className="p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
    >
      {/* Score & Context info */}
      <div className="flex items-center gap-4">
        {/* Score Badge */}
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl font-black text-base border"
          style={{
            backgroundColor: getScoreBg(score),
            color: getScoreColor(score),
            borderColor: score !== null ? `${getScoreColor(score)}40` : 'var(--color-border)',
          }}
        >
          {score !== null ? score : '—'}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[var(--color-text)] leading-tight">
              {review.project?.projectName || 'Snippet Review'}
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold uppercase">
              {review.reviewType}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1 capitalize font-medium text-[var(--color-text-secondary)]">
              <HiOutlineCodeBracket className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
              {review.language || 'unknown'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HiOutlineClock className="w-3.5 h-3.5" />
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
        {/* Findings Count */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            Findings
          </span>
          <span className="text-sm font-bold text-[var(--color-text)]">{findingsCount} issues</span>
        </div>

        {/* Action button grouping */}
        <div className="flex items-center gap-2">
          {/* Delete Action */}
          <button
            onClick={() => onDelete(review.id)}
            className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-muted)] transition-colors duration-200 cursor-pointer"
            title="Delete review"
          >
            <HiOutlineTrash className="w-4 h-4" />
          </button>

          {/* View Report */}
          <Link
            to={`/review/${review.id}`}
            className="flex items-center gap-1 px-3 py-2 bg-[var(--color-bg-secondary)] hover:bg-[var(--color-surface-hover)] text-xs font-semibold text-[var(--color-text)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200"
          >
            Report
            <HiOutlineChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
