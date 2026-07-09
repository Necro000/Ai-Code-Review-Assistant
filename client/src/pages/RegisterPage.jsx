import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineArrowRight, HiOutlineCodeBracketSquare } from 'react-icons/hi2';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const { register: registerUserSession, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    await registerUserSession(data.name, data.email, data.password);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-[#0a0e1a] overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20 filter blur-[120px]"
        style={{ background: 'var(--gradient-brand)' }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-10 filter blur-[120px]"
        style={{ background: 'var(--color-accent)' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlineCodeBracketSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
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
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <HiOutlineUser className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: errors.name ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.name) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-accent-glow)';
                  }}
                  onBlur={(e) => {
                    if (!errors.name) e.target.style.borderColor = 'var(--color-border)';
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
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <span className="text-lg">@</span>
                </div>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
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
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
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
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                      message: 'Must contain 8+ characters, with 1 uppercase, 1 lowercase and 1 number',
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-xs max-w-[340px]" style={{ color: 'var(--color-error)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--color-text-muted)]">
                  <HiOutlineLockClosed className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  onFocus={(e) => {
                    if (!errors.confirmPassword) e.target.style.borderColor = 'var(--color-accent)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-accent-glow)';
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) e.target.style.borderColor = 'var(--color-border)';
                    e.target.style.boxShadow = 'none';
                  }}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
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
                  Register Account
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-accent-hover)' }}
            >
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
