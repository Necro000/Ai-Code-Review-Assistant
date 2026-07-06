export default function ReviewHeader({ review }) {
  const score = review.overallScore;

  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--color-success)';
    if (s >= 50) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreText = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 50) return 'Needs Work';
    return 'Critical';
  };

  return (
    <div
      className="rounded-2xl border p-6 glass flex flex-col md:flex-row gap-6 items-center justify-between"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Score Circle Progress */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex items-center justify-center w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Circle */}
            <path
              className="text-[var(--color-border)]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Circle */}
            <path
              className="transition-all duration-1000 ease-out"
              strokeDasharray={`${score || 0}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke={getScoreColor(score || 0)}
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          {/* Inner Text */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white">{score !== null ? score : 'N/A'}</span>
            {score !== null && (
              <span
                className="text-[8px] font-bold uppercase tracking-wider"
                style={{ color: getScoreColor(score) }}
              >
                {getScoreText(score)}
              </span>
            )}
          </div>
        </div>

        {/* Metadata Details */}
        <div className="text-center sm:text-left space-y-1">
          <div className="flex items-center flex-wrap gap-2 justify-center sm:justify-start">
            <h2 className="text-xl font-bold text-white leading-tight">
              {review.project?.projectName}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white font-medium capitalize">
              {review.reviewType.replace('_', ' ')}
            </span>
          </div>
          
          <div className="text-xs text-[var(--color-text-muted)] space-x-2">
            <span>Language: <strong className="text-white capitalize">{review.language || 'Unknown'}</strong></span>
            <span>•</span>
            <span>
              Analyzed:{' '}
              <strong className="text-white">
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
        className="flex-1 md:max-w-md p-4 rounded-xl border bg-[rgba(10,14,26,0.3)] text-sm leading-relaxed"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
          AI Summary & Insights
        </span>
        <p className="whitespace-pre-line">
          {review.summary || 'No review summary was generated.'}
        </p>
      </div>
    </div>
  );
}
