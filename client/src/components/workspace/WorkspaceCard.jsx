import { Link } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineFolder, HiOutlineCalendar } from 'react-icons/hi2';

export default function WorkspaceCard({ workspace }) {
  const memberCount = workspace.members?.length || 0;
  const projectCount = workspace.projects?.length || 0;

  return (
    <Link
      to={`/workspace/${workspace.id}`}
      className="block rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg"
    >
      <div className="space-y-4">
        {/* Workspace Name & Role */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-white leading-tight">
            {workspace.name}
          </h3>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
            {workspace.owner?.name ? `Owner: ${workspace.owner.name.split(' ')[0]}` : 'Workspace'}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-surface-hover)]">
              <HiOutlineUserGroup className="w-4 h-4 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Members</p>
              <p className="font-bold text-white mt-0.5">{memberCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-surface-hover)]">
              <HiOutlineFolder className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Projects</p>
              <p className="font-bold text-white mt-0.5">{projectCount}</p>
            </div>
          </div>
        </div>

        {/* Footer date */}
        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <HiOutlineCalendar className="w-3.5 h-3.5" />
            Created {new Date(workspace.createdAt).toLocaleDateString()}
          </span>
          <span className="font-medium text-[var(--color-accent-hover)] hover:underline">
            View Details &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
