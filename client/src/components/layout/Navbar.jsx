import { useState, useRef, useEffect } from 'react';
import { HiOutlineCodeBracketSquare, HiOutlineBell, HiOutlineCheck, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

export default function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const initials = user?.name ? user.name[0].toUpperCase() : 'U';
  const displayName = user?.name ? user.name.split(' ')[0] : 'User';

  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Review Complete',
      message: 'Your review for "db.js" completed successfully.',
      time: 'Just now',
      unread: true,
    },
    {
      id: 2,
      title: 'Welcome!',
      message: 'Thanks for choosing AI Code Review Assistant. Start by creating a project.',
      time: '1 hour ago',
      unread: false,
    },
  ]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setHasUnread(false);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setHasUnread(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 border-b transition-colors duration-200"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Logo & Brand */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div
          className="flex items-center justify-center w-9 h-9 rounded-xl animate-pulse-glow"
          style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
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
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? (
            <HiOutlineSun className="w-5 h-5 text-amber-400" />
          ) : (
            <HiOutlineMoon className="w-5 h-5 text-indigo-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-transparent hover:border-[var(--color-border)]"
          style={{
            backgroundColor: showNotifications ? 'var(--color-surface-hover)' : 'transparent',
          }}
          onMouseEnter={(e) => {
            if (!showNotifications) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          }}
          onMouseLeave={(e) => {
            if (!showNotifications) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Notifications"
          aria-label="View Notifications"
        >
          <HiOutlineBell className="w-5 h-5" />
          {hasUnread && (
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-[var(--color-bg-secondary)]"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div
            className="absolute right-0 mt-2 w-80 rounded-2xl border p-4 glass z-50 text-left shadow-2xl animate-fade-in-scale"
            style={{
              top: 'var(--navbar-height)',
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <div
              className="flex items-center justify-between pb-2.5 mb-2.5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                Notifications
              </span>
              <div className="flex items-center gap-2.5">
                {hasUnread && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold flex items-center gap-1 text-[var(--color-accent-hover)] hover:underline cursor-pointer"
                  >
                    <HiOutlineCheck className="w-3 h-3" />
                    Read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] font-semibold flex items-center gap-1 text-[var(--color-text-muted)] hover:text-[var(--color-error)] hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl transition-colors border"
                    style={{
                      backgroundColor: n.unread ? 'var(--color-accent-muted)' : 'var(--color-surface)',
                      borderColor: n.unread ? 'rgba(99, 102, 241, 0.2)' : 'var(--color-border)',
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-xs font-bold ${
                          n.unread ? 'text-[var(--color-accent-hover)]' : 'text-[var(--color-text)]'
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap font-medium">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-10 h-10 bg-[var(--color-accent-muted)] rounded-full flex items-center justify-center text-[var(--color-accent)] mb-2 font-bold">
                    ✓
                  </div>
                  <span className="text-xs font-bold text-[var(--color-text)]">All caught up!</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">No new notifications.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-[var(--color-surface-hover)] border border-transparent hover:border-[var(--color-border)]"
          title="Account Settings"
          aria-label="User Profile"
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-black"
            style={{
              background: 'var(--gradient-brand)',
              color: 'white',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            {initials}
          </div>
          <span
            className="text-xs font-bold hidden sm:block"
            style={{ color: 'var(--color-text)' }}
          >
            {displayName}
          </span>
        </button>
      </div>
    </header>
  );
}
