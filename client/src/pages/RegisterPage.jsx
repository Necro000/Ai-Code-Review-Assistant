import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineArrowRight,
  HiOutlineCodeBracketSquare,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlineSparkles,
  HiOutlineCpuChip,
  HiOutlineChartBarSquare,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';

const FEATURES = [
  { icon: HiOutlineSparkles,       text: 'AI review powered by Groq LLM'   },
  { icon: HiOutlineShieldCheck,    text: 'Detect bugs before they reach prod' },
  { icon: HiOutlineCpuChip,        text: 'Cyclomatic complexity & LOC metrics' },
  { icon: HiOutlineChartBarSquare, text: 'Track quality scores over time'   },
];

const PERKS = [
  'Free forever plan',
  'No credit card needed',
  'Unlimited reviews',
];

const GithubIcon = () => (
  <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

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

  const onInvalid = (formErrors) => {
    const errorMessages = Object.values(formErrors).map((e) => e.message).filter(Boolean);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    } else {
      toast.error('Please fill in all required fields correctly.');
    }
  };

  const inputStyle = (hasError) => ({
    backgroundColor: 'var(--color-bg-secondary)',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    color: 'var(--color-text)',
  });

  const onInputFocus = (e, hasError) => {
    if (!hasError) e.target.style.borderColor = 'var(--color-accent)';
    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
  };

  const onInputBlur = (e, hasError) => {
    e.target.style.borderColor = hasError ? 'var(--color-error)' : 'var(--color-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      {/* ── Background layer ── */}
      <div
        className="absolute top-[-15%] right-[-12%] w-[55%] h-[55%] rounded-full pointer-events-none animate-orb"
        style={{
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      <div
        className="absolute bottom-[-18%] left-[-10%] w-[48%] h-[48%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.14) 0%, transparent 70%)',
          filter: 'blur(90px)',
          animation: 'orb-float 16s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-[60%] right-[25%] w-[20%] h-[20%] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(167,139,250,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animation: 'orb-float 10s ease-in-out infinite',
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Page layout ── */}
      <div className="relative z-10 w-full max-w-5xl flex items-start gap-12 animate-fade-in">

        {/* ── Left: feature showcase (lg+) ── */}
        <div className="hidden lg:flex flex-col flex-1 space-y-8 pt-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl animate-pulse-glow"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-lg)' }}
            >
              <HiOutlineCodeBracketSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-base font-extrabold tracking-tight gradient-text">CodeReview AI</p>
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
                Assistant
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Write better code,<br />
              <span className="gradient-text">every single day.</span>
            </h2>
            <p className="text-sm max-w-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Join thousands of developers using AI-driven analysis to ship cleaner, more maintainable code with confidence.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-slide-left"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: 'var(--color-accent-muted)', border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-hover)' }} />
                  </div>
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    {f.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Perks pill row */}
          <div className="flex flex-wrap gap-2 animate-fade-in animate-delay-400">
            {PERKS.map((perk) => (
              <div
                key={perk}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--color-success-muted)',
                  color: 'var(--color-success)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}
              >
                <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                {perk}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Register form ── */}
        <div className="w-full max-w-md flex-shrink-0 mx-auto lg:mx-0">
          {/* Mobile brand header */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-pulse-glow"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-lg)' }}
            >
              <HiOutlineCodeBracketSquare className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Create Account</h1>
            <p className="mt-2 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Join CodeReview AI — free forever
            </p>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Free forever · no credit card required
            </p>
          </div>

          {/* GitHub — first / prominent */}
          <a
            href={`${import.meta.env.VITE_API_URL || ''}/api/auth/github`}
            onClick={() => setGithubRedirecting(true)}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer mb-5"
            style={{
              backgroundColor: '#161b22',
              border: '1px solid rgba(240,246,252,0.1)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1c2128';
              e.currentTarget.style.borderColor = 'rgba(240,246,252,0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#161b22';
              e.currentTarget.style.borderColor = 'rgba(240,246,252,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
            }}
          >
            {githubRedirecting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0" />
                <span>Redirecting to GitHub…</span>
              </>
            ) : (
              <>
                <GithubIcon />
                <span>Sign up with GitHub</span>
              </>
            )}
          </a>

          {/* Divider */}
          <div className="relative flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
            <span className="text-xs font-medium px-1" style={{ color: 'var(--color-text-muted)' }}>
              or register with email
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Register Card */}
          <div
            className="rounded-2xl border p-7 glass"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-4">
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
                    style={inputStyle(!!errors.name)}
                    onFocus={(e) => onInputFocus(e, !!errors.name)}
                    onBlur={(e) => onInputBlur(e, !!errors.name)}
                    {...register('name', {
                      required: 'Full Name is required',
                      minLength: { value: 2, message: 'Minimum 2 characters' },
                      maxLength: { value: 50, message: 'Maximum 50 characters' },
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>⚠ {errors.name.message}</p>
                )}
              </div>

              {/* Email */}
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
                    style={inputStyle(!!errors.email)}
                    onFocus={(e) => onInputFocus(e, !!errors.email)}
                    onBlur={(e) => onInputBlur(e, !!errors.email)}
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
                    style={inputStyle(!!errors.password)}
                    onFocus={(e) => onInputFocus(e, !!errors.password)}
                    onBlur={(e) => onInputBlur(e, !!errors.password)}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters long',
                      },
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs max-w-xs" style={{ color: 'var(--color-error)' }}>⚠ {errors.password.message}</p>
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
                    style={inputStyle(!!errors.confirmPassword)}
                    onFocus={(e) => onInputFocus(e, !!errors.confirmPassword)}
                    onBlur={(e) => onInputBlur(e, !!errors.confirmPassword)}
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
                className="btn-primary w-full py-3 text-sm tracking-wide"
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold hover:underline"
                style={{ color: 'var(--color-accent-hover)' }}
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Terms footnote */}
          <p className="text-center text-[11px] mt-4" style={{ color: 'var(--color-text-muted)' }}>
            By creating an account you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span>{' '}
            and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
