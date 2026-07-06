import { HiOutlineCodeBracketSquare, HiOutlineBell } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';
  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 border-b"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'rgba(10, 14, 26, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo & Brand */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg"
          style={{ background: 'var(--gradient-brand)' }}
        >
          <HiOutlineCodeBracketSquare className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight gradient-text">
            CodeReview AI
          </span>
          <span
            className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Assistant
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer text-[var(--color-text-secondary)] hover:text-white"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: 'var(--color-accent)' }}
          />
        </button>

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 cursor-pointer hover:bg-[var(--color-surface-hover)]"
          title="Account Settings"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
            style={{
              background: 'var(--gradient-brand)',
              color: 'white',
            }}
          >
            {initials}
          </div>
          <span
            className="text-sm font-medium hidden sm:block"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {displayName}
          </span>
        </button>
      </div>
    </header>
  );
}
