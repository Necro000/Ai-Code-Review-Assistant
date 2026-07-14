import { HiOutlineUserGroup } from 'react-icons/hi2';

export default function CollaboratorsBar({ users = [] }) {
  if (users.length <= 1) return null; // Don't show if user is alone

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[var(--color-surface)] border-[var(--color-border)] animate-fade-in shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider pr-1 border-r border-[var(--color-border)]">
        <HiOutlineUserGroup className="w-3.5 h-3.5 text-[var(--color-accent)] animate-pulse" />
        <span>Active</span>
      </div>

      <div className="flex -space-x-1.5 overflow-hidden">
        {users.map((collab) => (
          <div
            key={collab.userId}
            title={collab.userName}
            className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-accent-muted)] text-[var(--color-accent)] text-[9px] font-bold ring-1 ring-transparent hover:ring-[var(--color-accent)] transition-all cursor-default select-none uppercase"
          >
            {collab.initials}
          </div>
        ))}
      </div>
    </div>
  );
}
