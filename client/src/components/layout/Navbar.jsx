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
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 border-b"
      style={{
        height: 'var(--navbar-height)',
        backgroundColor: 'var(--color-bg-secondary)',
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
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--color-surface-hover)]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <HiOutlineSun className="w-5 h-5" />
          ) : (
            <HiOutlineMoon className="w-5 h-5" />
          )}
        </button>

        {/* Notifications */}
        <button
          onClick={toggleNotifications}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer text-[var(--color-text-secondary)] hover:text-white"
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
        >
          <HiOutlineBell className="w-5 h-5" />
          {hasUnread && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-accent)' }}
            />
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div
            className="absolute right-0 mt-2 w-80 rounded-xl border p-4 glass z-50 text-left shadow-2xl animate-fade-in"
            style={{
              top: 'var(--navbar-height)',
              borderColor: 'var(--color-border)',
              backgroundColor: 'var(--color-bg-secondary)',
            }}
          >
            <div
              className="flex items-center justify-between pb-2 mb-2 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-xs font-bold text-white uppercase tracking-wider">
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
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: n.unread ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          n.unread ? 'text-white' : 'text-[var(--color-text-secondary)]'
                        }`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
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
                  <div className="w-10 h-10 bg-[var(--color-accent-muted)] rounded-full flex items-center justify-center text-[var(--color-accent)] mb-2 animate-pulse">
                    ✓
                  </div>
                  <span className="text-xs font-semibold text-white">All caught up!</span>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-0.5">No new notifications.</span>
                </div>
              )}
            </div>
          </div>
        )}

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
