import {
  HiOutlineBars3BottomLeft,
  HiOutlineVariable,
  HiOutlineCircleStack,
  HiOutlineCpuChip,
} from 'react-icons/hi2';

export default function ComplexityPanel({ code = '', language = '' }) {
  const lang = language ? language.toLowerCase() : 'unknown';

  // --- Inline calculation logic (matches backend rules for self-containment) ---
  const isComment = (line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;
    if (lang === 'python' || lang === 'ruby') {
      return trimmed.startsWith('#');
    }
    return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/');
  };

  const lines = code.split('\n');
  const loc = lines.filter((l) => l.trim() && !isComment(l)).length;

  const countFunctions = () => {
    if (lang === 'python' || lang === 'ruby') {
      const defs = code.match(/^\s*def\s+[a-zA-Z_]\w*/gm);
      return defs ? defs.length : 0;
    }
    const traditional = code.match(/function\s+[a-zA-Z_]\w*\s*\(/g) || [];
    const arrows = code.match(/=>/g) || [];
    return traditional.length + arrows.length;
  };

  const countClasses = () => {
    const classes = code.match(/^\s*class\s+[a-zA-Z_]\w*/gm);
    return classes ? classes.length : 0;
  };

  const calculateCC = () => {
    let cc = 1;
    lines.forEach((line) => {
      if (isComment(line)) return;
      if (lang === 'python') {
        const matches = line.match(/\b(if|elif|for|while|except|and|or)\b/g);
        if (matches) cc += matches.length;
      } else {
        const keywords = line.match(/\b(if|for|while|catch|case)\b/g) || [];
        const logic = line.match(/(&&|\|\|)/g) || [];
        const ternary = line.match(/\?/g) || [];
        cc += keywords.length + logic.length + ternary.length;
      }
    });
    return cc;
  };

  const fnCount = countFunctions();
  const classCount = countClasses();
  const complexity = calculateCC();
  const avgCC = fnCount > 0 ? (complexity / fnCount).toFixed(1) : complexity;

  const getRating = (cc) => {
    if (cc <= 5) return { text: 'Low — Simple', color: 'var(--color-success)' };
    if (cc <= 10) return { text: 'Moderate', color: 'var(--color-warning)' };
    return { text: 'High — Needs Refactoring', color: 'var(--color-error)' };
  };

  const rating = getRating(complexity);

  const metrics = [
    { label: 'Lines of Code (LOC)', value: loc, icon: HiOutlineBars3BottomLeft, color: 'var(--color-accent)' },
    { label: 'Functions Detected', value: fnCount, icon: HiOutlineVariable, color: 'var(--color-accent)' },
    { label: 'Classes Defined', value: classCount, icon: HiOutlineCircleStack, color: 'var(--color-accent)' },
    { label: 'Complexity Index (CC)', value: complexity, icon: HiOutlineCpuChip, color: rating.color },
  ];

  return (
    <div
      className="rounded-2xl border p-5 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-300 w-full space-y-4"
    >
      <h3 className="text-sm font-semibold text-white">Complexity Metrics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ backgroundColor: 'rgba(99, 102, 241, 0.06)' }}
              >
                <Icon className="w-4 h-4" style={{ color: m.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] tracking-wide uppercase">
                  {m.label.split(' ')[0]}
                </span>
                <span className="text-base font-bold text-white leading-tight mt-0.5">
                  {m.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 flex items-center justify-between text-xs border-t border-[var(--color-border)]">
        <span className="text-[var(--color-text-muted)]">
          Average complexity per function:{' '}
          <strong className="text-white">{avgCC}</strong>
        </span>
        <span className="font-semibold" style={{ color: rating.color }}>
          Rating: {rating.text}
        </span>
      </div>
    </div>
  );
}
