import { HiOutlineSparkles } from 'react-icons/hi2';

export default function RefactoringPanel({ tips = [] }) {
  if (tips.length === 0) return null;
  return (
    <div className="rounded-2xl border p-6 space-y-4 bg-[var(--color-surface)] border-[var(--color-border)] shadow-sm">
      <h3 className="text-base font-semibold text-[var(--color-text)] flex items-center gap-2">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-accent-muted)]">
          <HiOutlineSparkles className="w-5 h-5 text-[var(--color-accent)]" />
        </div>
        AI Refactoring Suggestions ({tips.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3 p-4 rounded-xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200">
            <span className="text-[var(--color-accent)] font-bold text-base flex-shrink-0">{i + 1}.</span>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{tip.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
