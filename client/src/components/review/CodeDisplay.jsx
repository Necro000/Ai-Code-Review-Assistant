import { useEffect, useRef } from 'react';

export default function CodeDisplay({ code = '', language = '', highlightedLine = null }) {
  const containerRef = useRef(null);
  const lines = code.split('\n');

  useEffect(() => {
    if (highlightedLine !== null && containerRef.current) {
      const lineElement = containerRef.current.querySelector(`#line-${highlightedLine}`);
      if (lineElement) {
        lineElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [highlightedLine]);

  return (
    <div
      className="flex flex-col border rounded-2xl overflow-hidden font-mono text-sm leading-relaxed shadow-sm"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Code Header bar */}
      <div className="px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Source Code
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-accent-hover)] bg-[var(--color-accent-muted)] px-2.5 py-0.5 rounded-full border border-[var(--color-accent)]/20">
          {language || 'text'}
        </span>
      </div>

      {/* Code scroll body */}
      <div
        ref={containerRef}
        className="flex overflow-auto h-[480px] py-4"
        style={{
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.5rem',
        }}
      >
        {/* Line numbers column */}
        <div className="select-none text-right pr-3 pl-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] w-12 flex-shrink-0 bg-[var(--color-bg-tertiary)]">
          {lines.map((_, i) => (
            <div key={i} className="h-6 leading-6 text-xs font-semibold">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Lines representation */}
        <div className="flex-1 overflow-x-auto min-w-0">
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightedLine === lineNum;

            return (
              <div
                key={i}
                id={`line-${lineNum}`}
                className={`h-6 px-4 whitespace-pre font-mono transition-all duration-200 w-full text-xs leading-6 ${
                  isHighlighted
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)] font-bold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
                }`}
                style={{
                  borderLeft: isHighlighted ? '3px solid var(--color-accent)' : '3px solid transparent',
                }}
              >
                {line === '' ? ' ' : line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
