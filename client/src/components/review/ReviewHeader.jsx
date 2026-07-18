import ScoreBadge from './ScoreBadge';

export default function ReviewHeader({ review }) {
  const score = review.overallScore;

  return (
    <div
      className="rounded-2xl border p-6 glass flex flex-col md:flex-row gap-6 items-center justify-between"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Score Circle Progress */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <ScoreBadge score={score} size={96} />

        {/* Metadata Details */}
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-[var(--color-text)] leading-tight">
              {review.project?.projectName || 'Code Review'}
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold capitalize">
              {review.reviewType.replace('_', ' ')}
            </span>
          </div>
          
          <div className="text-xs text-[var(--color-text-muted)] space-x-2">
            <span>Language: <strong className="text-[var(--color-text)] capitalize">{review.language || 'Unknown'}</strong></span>
            <span>•</span>
            <span>
              Analyzed:{' '}
              <strong className="text-[var(--color-text)]">
                {new Date(review.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Summary Explanation */}
      <div
        className="flex-1 md:max-w-md p-4 rounded-xl border bg-[var(--color-bg-secondary)] text-sm leading-relaxed"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
          AI Summary & Insights
        </span>
        <p className="whitespace-pre-line text-[var(--color-text-secondary)]">
          {review.summary || 'No review summary was generated.'}
        </p>
      </div>
    </div>
  );
}
