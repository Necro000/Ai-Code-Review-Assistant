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
      className="flex flex-col border rounded-xl overflow-hidden font-mono text-sm leading-relaxed"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Code Header bar */}
      <div className="px-5 py-2.5 border-b border-[var(--color-border)] flex items-center justify-between bg-[rgba(10,14,26,0.3)]">
        <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Source Code</span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-accent-hover)] bg-[var(--color-accent-muted)] px-2 py-0.5 rounded border border-[var(--color-accent)]">
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
        <div className="select-none text-right pr-3 pl-4 border-r border-[var(--color-border)] text-[var(--color-text-muted)] w-12 flex-shrink-0">
          {lines.map((_, i) => (
            <div key={i} className="h-6">
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
                className={`h-6 px-4 whitespace-pre font-mono transition-all duration-300 w-full ${
                  isHighlighted
                    ? 'bg-[var(--color-accent-muted)] border-l-2 text-white font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-white'
                }`}
                style={{
                  borderLeftColor: isHighlighted ? 'var(--color-accent)' : 'transparent',
                }}
              >
                {/* Prevent empty lines from collapsing */}
                {line === '' ? ' ' : line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
