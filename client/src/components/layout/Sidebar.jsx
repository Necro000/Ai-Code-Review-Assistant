import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiOutlineHome,
  HiOutlineCodeBracket,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineChevronLeft,
  HiOutlinePlusCircle,
  HiOutlineUserGroup,
  HiOutlineCpuChip,
  HiOutlineTrophy,
} from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/review/new', label: 'New Review', icon: HiOutlinePlusCircle },
  { path: '/history', label: 'History', icon: HiOutlineClock },
  { path: '/pr/review', label: 'PR Review', icon: HiOutlineCodeBracket },
  { path: '/workspace', label: 'Workspaces', icon: HiOutlineUserGroup },
  { path: '/leaderboard', label: 'Leaderboard', icon: HiOutlineTrophy },
  { path: '/profile', label: 'Profile', icon: HiOutlineUser },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [...NAV_ITEMS];
  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Panel', icon: HiOutlineCpuChip });
  }

  const initials = user?.name ? user.name[0].toUpperCase() : 'U';
  const displayName = user?.name ? user.name.split(' ')[0] : 'User';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Member';

  return (
    <aside
      className={`fixed left-0 top-[var(--navbar-height)] bottom-0 z-30 flex flex-col border-r transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[72px]' : 'w-[var(--sidebar-width)]'
      }`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Section Label */}
      {!collapsed && (
        <div className="px-5 pt-5 pb-1">
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Navigation
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : ''}
              className={`relative group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'text-white' : 'hover:text-white'
              }`}
              style={{
                backgroundColor: isActive ? 'var(--color-accent-muted)' : 'transparent',
                color: isActive ? 'var(--color-accent-hover)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                />
              )}

              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`}
              />

              {!collapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}

              {/* Tooltip when collapsed */}
              {collapsed && (
                <div
                  className="pointer-events-none absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
                  style={{
                    backgroundColor: 'var(--color-surface-active)',
                    border: '1px solid var(--color-border-hover)',
                    boxShadow: 'var(--shadow-lg)',
                  }}
                >
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info Section */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <div
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white flex-shrink-0"
              style={{ background: 'var(--gradient-brand)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{displayName}</p>
              <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{roleLabel}</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--color-text-muted)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <HiOutlineChevronLeft
            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
