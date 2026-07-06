import { HiOutlineCodeBracket } from 'react-icons/hi2';

const LANGUAGES = [
  { value: 'auto', label: 'Auto-detect Language' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c/cpp', label: 'C/C++' },
  { value: 'go', label: 'Go' },
  { value: 'ruby', label: 'Ruby' },
];

export default function LanguageSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
        <HiOutlineCodeBracket className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 bg-[var(--color-bg-secondary)] border rounded-lg text-sm focus:outline-none transition-all duration-200 cursor-pointer"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'var(--color-accent)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--color-border)';
        }}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-[var(--color-bg-secondary)] text-[var(--color-text)]">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
