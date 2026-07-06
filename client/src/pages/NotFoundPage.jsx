import { Link } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineQuestionMarkCircle } from 'react-icons/hi2';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div
        className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-accent-muted)] text-[var(--color-accent-hover)]"
        style={{ boxShadow: 'var(--shadow-glow)' }}
      >
        <HiOutlineQuestionMarkCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Page Not Found</h1>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
          The page you are looking for doesn&apos;t exist or was moved to another location.
        </p>
      </div>

      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl text-sm font-semibold text-white transition-colors duration-200"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>
    </div>
  );
}
