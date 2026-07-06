import { useState } from 'react';
import FindingCard from './FindingCard';

export default function FindingsList({ findings = [], onJump }) {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');

  const filtered = findings.filter((f) => {
    const matchSeverity = severityFilter === 'all' || f.severity === severityFilter;
    const matchSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'ai' ? f.source === 'ai' : f.source !== 'ai');

    return matchSeverity && matchSource;
  });

  const getSeverityCount = (sev) => {
    return findings.filter((f) => f.severity === sev).length;
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
          Analysis Findings ({filtered.length})
        </span>

        <div className="flex flex-wrap gap-2">
          {/* Severity Filter Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2 py-1 bg-[var(--color-bg-secondary)] border rounded-lg text-xs focus:outline-none transition-colors duration-200 cursor-pointer text-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="all">All Severities ({findings.length})</option>
            <option value="error">Errors ({getSeverityCount('error')})</option>
            <option value="warning">Warnings ({getSeverityCount('warning')})</option>
            <option value="info">Info ({getSeverityCount('info')})</option>
          </select>

          {/* Source Filter Dropdown */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-2 py-1 bg-[var(--color-bg-secondary)] border rounded-lg text-xs focus:outline-none transition-colors duration-200 cursor-pointer text-white"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <option value="all">All Sources</option>
            <option value="linter">Static Checkers (ESLint/Pylint)</option>
            <option value="ai">AI Analysis (LLM)</option>
          </select>
        </div>
      </div>

      {/* Card Listing */}
      {filtered.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-dashed border-[var(--color-border)] bg-[rgba(10,14,26,0.15)]">
          <p className="text-sm text-[var(--color-text-muted)]">No findings match your active filters.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {filtered.map((finding) => (
            <FindingCard key={finding.id} finding={finding} onJump={onJump} />
          ))}
        </div>
      )}
    </div>
  );
}
