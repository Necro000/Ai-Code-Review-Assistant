import { HiOutlineCodeBracket, HiOutlineCpuChip, HiOutlineExclamationTriangle, HiOutlineLightBulb } from 'react-icons/hi2';

export default function FindingCard({ finding, onJump }) {
  const { source, severity, issue, explanation, suggestedFix, lineNumber } = finding;

  const getSeverityColor = (sev) => {
    if (sev === 'error') return 'var(--color-error)';
    if (sev === 'warning') return 'var(--color-warning)';
    return 'var(--color-info)';
  };

  const getSeverityBg = (sev) => {
    if (sev === 'error') return 'var(--color-error-muted)';
    if (sev === 'warning') return 'var(--color-warning-muted)';
    return 'var(--color-info-muted)';
  };

  return (
    <div
      className="p-5 rounded-xl border space-y-4 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200"
    >
      {/* Card Header: Badges & Jump Action */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Severity Badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1"
            style={{
              backgroundColor: getScoreBg(severity),
              color: getSeverityColor(severity),
              borderColor: getSeverityColor(severity),
            }}
          >
            <HiOutlineExclamationTriangle className="w-3 h-3" />
            {severity}
          </span>

          {/* Line Location */}
          {lineNumber && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white">
              Line {lineNumber}
            </span>
          )}

          {/* Source Tag */}
          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
            {source === 'ai' ? (
              <HiOutlineCpuChip className="w-3.5 h-3.5" style={{ color: 'var(--color-accent)' }} />
            ) : (
              <HiOutlineCodeBracket className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
            )}
            {source === 'ai' ? 'AI Review' : source.toUpperCase()}
          </span>
        </div>

        {/* Jump Button */}
        {lineNumber && onJump && (
          <button
            onClick={() => onJump(lineNumber)}
            className="text-xs font-semibold hover:underline cursor-pointer"
            style={{ color: 'var(--color-accent-hover)' }}
          >
            Jump to Line
          </button>
        )}
      </div>

      {/* Main Issue text */}
      <div className="space-y-1">
        <h4 className="text-sm font-bold text-white">{issue}</h4>
        {explanation && (
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
            {explanation}
          </p>
        )}
      </div>

      {/* Suggested Fix block */}
      {suggestedFix && (
        <div
          className="rounded-lg border p-3 text-xs space-y-2 bg-[rgba(10,14,26,0.25)] border-[var(--color-border)]"
        >
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <HiOutlineLightBulb className="w-4 h-4 text-[var(--color-warning)]" />
            Suggested Fix
          </div>
          <pre className="font-mono text-[var(--color-text-secondary)] overflow-x-auto p-2 bg-[var(--color-bg-secondary)] rounded-md border border-[var(--color-border)] leading-relaxed max-w-full whitespace-pre-wrap break-all">
            {suggestedFix}
          </pre>
        </div>
      )}
    </div>
  );
}

// Utility helper matching mapping
const getScoreBg = (sev) => {
  if (sev === 'error') return 'var(--color-error-muted)';
  if (sev === 'warning') return 'var(--color-warning-muted)';
  return 'var(--color-info-muted)';
};
