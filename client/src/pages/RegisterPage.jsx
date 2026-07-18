import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineCodeBracketSquare, HiOutlineEnvelope, HiOutlineShieldCheck } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const PERKS = [
  { icon: HiOutlineShieldCheck, text: 'AI-powered code analysis in seconds' },
  { icon: HiOutlineCodeBracketSquare, text: 'Static + dynamic multi-language linting' },
  { icon: HiOutlineLockClosed, text: 'Private and secure — your code stays yours' },
];

export default function RegisterPage() {
  const { register: registerUserSession, isLoading } = useAuth();
  const [githubRedirecting, setGithubRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    await registerUserSession(data.name, data.email, data.password);
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* Animated background orbs */}
      <div
        className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full pointer-events-none animate-orb"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute bottom-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'orb-float 15s ease-in-out infinite reverse',
        }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5 animate-pulse-glow"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-lg)' }}
          >
            <HiOutlineCodeBracketSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h1>
          <p className="mt-2 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
            Join CodeReview AI and level up your code quality
          </p>
        </div>

        {/* Register Card */}
        <div
          className="rounded-2xl border p-8 glass"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `1px solid ${errors.name ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.name) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? 'var(--color-error)' : 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-xs flex items-center gap-1" style={{ color: 'var(--color-error)' }}>
                  ⚠ {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <HiOutlineEnvelope className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `1px solid ${errors.email ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.email) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? 'var(--color-error)' : 'var(--color-border)';
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
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>⚠ {errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `1px solid ${errors.password ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.password) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.password ? 'var(--color-error)' : 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                      message: 'Must be 8+ chars with uppercase, lowercase and number',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs max-w-[340px]" style={{ color: 'var(--color-error)' }}>⚠ {errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: 'var(--color-text-muted)' }}>
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: `1px solid ${errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border)'}`,
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>⚠ {errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 my-2">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            </div>

            {/* GitHub OAuth */}
            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/auth/github`}
              onClick={() => setGithubRedirecting(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
              }}
            >
              {githubRedirecting ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              )}
              {githubRedirecting ? 'Redirecting to GitHub...' : 'Continue with GitHub'}
            </a>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-accent-hover)' }}>
              Log in instead
            </Link>
          </div>
        </div>

        {/* Perks Row */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.text}
                className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(26,37,64,0.5)', border: '1px solid var(--color-border)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-accent-hover)' }} />
                <span className="text-[10px] leading-tight" style={{ color: 'var(--color-text-muted)' }}>
                  {perk.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
