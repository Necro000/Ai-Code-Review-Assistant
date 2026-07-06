import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a]">
        {/* Modern high-end loader animation */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
               style={{ borderColor: 'var(--color-accent) transparent transparent transparent' }} />
          <div className="absolute w-10 h-10 rounded-full border-4 border-b-transparent animate-spin"
               style={{ animationDirection: 'reverse', borderColor: 'transparent transparent var(--color-accent-hover) transparent' }} />
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }} />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
          Securing session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
