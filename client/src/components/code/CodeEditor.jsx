import { useRef, useEffect } from 'react';

export default function CodeEditor({ value, onChange, placeholder = 'Paste or type your code here...' }) {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = value.split('\n');

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  return (
    <div
      className="flex border rounded-xl overflow-hidden font-mono text-sm leading-relaxed relative"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
        height: '400px',
      }}
    >
      {/* Line Numbers Sidebar */}
      <div
        ref={lineNumbersRef}
        className="select-none py-4 text-right pr-3 pl-4 border-r flex flex-col overflow-hidden w-12 flex-shrink-0"
        style={{
          backgroundColor: 'var(--color-bg-tertiary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-muted)',
        }}
      >
        {lines.map((_, i) => (
          <div key={i} className="h-6 leading-6 text-xs font-semibold">
            {i + 1}
          </div>
        ))}
      </div>

      {/* Code Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck="false"
        className="flex-1 py-4 px-4 bg-transparent border-0 outline-none resize-none overflow-y-auto whitespace-pre h-full"
        style={{
          color: 'var(--color-text)',
          fontFamily: 'var(--font-mono)',
          lineHeight: '1.5rem',
        }}
      />
    </div>
  );
}
