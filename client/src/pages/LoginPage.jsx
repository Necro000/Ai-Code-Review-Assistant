import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineCodeBracketSquare } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    await login(data.email, data.password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-[#0a0e1a] overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20 filter blur-[120px]"
        style={{ background: 'var(--gradient-brand)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-10 filter blur-[120px]"
        style={{ background: 'var(--color-accent)' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlineCodeBracketSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Analyze your code with AI Review Assistant
          </p>
        </div>

        {/* Login Card */}
        <div
          className="rounded-2xl border p-8 glass"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <span className="text-lg">@</span>
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: errors.email ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-accent-glow)';
                  }}
                  onBlur={(e) => {
                    if (!errors.email) e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs hover:underline"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: errors.password ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-accent-glow)';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('password', {
                    required: 'Password is required',
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
              style={{
                background: 'var(--gradient-brand)',
                boxShadow: 'var(--shadow-glow)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                }
              }}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Log In
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* GitHub OAuth login */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[var(--color-bg-secondary)] px-2 text-[var(--color-text-muted)] font-medium">
                Or continue with
              </span>
            </div>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL || ''}/api/auth/github`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-accent-hover)' }}
            >
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
