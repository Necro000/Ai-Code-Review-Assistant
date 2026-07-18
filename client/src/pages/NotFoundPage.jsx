import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineQuestionMarkCircle,
  HiOutlineHome,
  HiOutlinePlusCircle,
  HiOutlineClock,
} from 'react-icons/hi2';

const LINKS = [
  { to: '/dashboard', label: 'Go to Dashboard', icon: HiOutlineHome },
  { to: '/review/new', label: 'New Review', icon: HiOutlinePlusCircle },
  { to: '/history', label: 'View History', icon: HiOutlineClock },
];

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 space-y-8 animate-fade-in">
      {/* Floating icon */}
      <div
        className="relative flex items-center justify-center w-24 h-24 rounded-3xl animate-float"
        style={{
          background: 'var(--gradient-brand)',
          boxShadow: 'var(--shadow-glow-lg)',
        }}
      >
        <span className="text-5xl font-black text-white select-none">404</span>
      </div>

      {/* Text */}
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Page Not Found</h1>
        <p
          className="text-sm max-w-sm mx-auto leading-relaxed"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved to another location.
        </p>
      </div>

      {/* Quick links */}
      <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap justify-center">
        {LINKS.map((link, i) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                i === 0
                  ? 'text-white'
                  : 'border'
              }`}
              style={
                i === 0
                  ? { background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }
                  : {
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-secondary)',
                    }
              }
              onMouseEnter={(e) => {
                if (i === 0) {
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow-lg)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                } else {
                  e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                  e.currentTarget.style.color = 'var(--color-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (i === 0) {
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                  e.currentTarget.style.transform = 'translateY(0)';
                } else {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                }
              }}
            >
              <Icon className="w-4 h-4" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
