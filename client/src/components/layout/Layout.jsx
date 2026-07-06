import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-surface)' }}>
      {/* Ambient glow effect */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(800px circle at 30% 20%, rgba(99, 102, 241, 0.04), transparent 50%), radial-gradient(600px circle at 80% 60%, rgba(139, 92, 246, 0.03), transparent 50%)',
        }}
      />

      <Navbar />
      <Sidebar />

      {/* Main Content Area */}
      <main
        className="relative z-10 pt-[var(--navbar-height)] transition-all duration-300"
        style={{
          marginLeft: 'var(--sidebar-width)',
        }}
      >
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
