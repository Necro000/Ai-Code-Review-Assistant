import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineArrowRight, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineCodeBracketSquare } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { forgotPasswordAPI, resetPasswordAPI } from '../api/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Request Email, 2 = Reset Password Form (if developer mode resetToken returns)
  const [resetToken, setResetToken] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState('');

  // Form for requesting reset
  const requestForm = useForm({ defaultValues: { email: '' } });
  
  // Form for setting new password
  const resetForm = useForm({ defaultValues: { password: '', confirmPassword: '' } });

  const onRequestEmail = async (data) => {
    setIsLoading(true);
    try {
      const response = await forgotPasswordAPI(data.email);
      setEmailSubmitted(data.email);
      toast.success(response.message || 'Reset request sent.');
      
      // Developer convenience: If backend returns resetToken, save it and skip to reset step
      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep(2);
      } else {
        setStep(3); // General success confirmation screen
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Something went wrong.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setIsLoading(true);
    try {
      const response = await resetPasswordAPI(resetToken, data.password);
      toast.success(response.message || 'Password reset successfully!');
      setStep(4); // Completed screen
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Invalid or expired token.';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-[#0a0e1a] overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none opacity-20 filter blur-[120px]"
        style={{ background: 'var(--gradient-brand)' }}
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlineCodeBracketSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white text-center">
            {step === 1 && 'Reset Password'}
            {step === 2 && 'Set New Password'}
            {(step === 3 || step === 4) && 'Check Your Email'}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] text-center">
            {step === 1 && 'Enter your email and we will send a password reset flow.'}
            {step === 2 && 'Reset token captured. Create a secure new password.'}
            {step === 3 && `A reset flow has been initiated for ${emailSubmitted}.`}
            {step === 4 && 'Your password has been updated.'}
          </p>
        </div>

        {/* Action Card */}
        <div
          className="rounded-2xl border p-8 glass"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={requestForm.handleSubmit(onRequestEmail)} className="space-y-6">
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
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{
                      borderColor: requestForm.formState.errors.email ? 'var(--color-error)' : 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                    onFocus={(e) => {
                      if (!requestForm.formState.errors.email) e.target.style.borderColor = 'var(--color-accent)';
                      e.target.style.boxShadow = '0 0 0 2px var(--color-accent-glow)';
                    }}
                    onBlur={(e) => {
                      if (!requestForm.formState.errors.email) e.target.style.borderColor = 'var(--color-border)';
                      e.target.style.boxShadow = 'none';
                    }}
                    {...requestForm.register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address',
                      },
                    })}
                  />
                </div>
                {requestForm.formState.errors.email && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {requestForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
                style={{
                  background: 'var(--gradient-brand)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Flow
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-center mt-4">
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-xs font-semibold hover:underline"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  <HiOutlineArrowLeft className="w-3.5 h-3.5" />
                  Back to Log In
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Dev mode - Setup New Password directly using the token */}
          {step === 2 && (
            <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
              {/* Developer Notice */}
              <div
                className="p-3 mb-4 rounded-lg text-xs leading-relaxed border"
                style={{
                  backgroundColor: 'var(--color-accent-muted)',
                  borderColor: 'var(--color-accent)',
                  color: 'var(--color-text)',
                }}
              >
                <strong>⚡ Developer Mode Alert:</strong> Stateless reset token bypassed email transmission and was received directly.
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: resetForm.formState.errors.password ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  {...resetForm.register('password', {
                    required: 'Password is required',
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                      message: 'Must contain 8+ characters, with 1 uppercase, 1 lowercase and 1 number',
                    },
                  })}
                />
                {resetForm.formState.errors.password && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {resetForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[var(--color-text-secondary)]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{
                    borderColor: resetForm.formState.errors.confirmPassword ? 'var(--color-error)' : 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                  {...resetForm.register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === resetForm.watch('password') || 'Passwords do not match',
                  })}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
                style={{
                  background: 'var(--gradient-brand)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Save New Password
                    <HiOutlineArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 3: Generic confirmation state */}
          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <HiOutlineCheckCircle className="w-16 h-16 mx-auto text-[var(--color-success)] animate-pulse" />
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                If the email address <strong>{emailSubmitted}</strong> exists, you will receive password reset instructions.
              </p>
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                  style={{ color: 'var(--color-accent-hover)' }}
                >
                  <HiOutlineArrowLeft className="w-4 h-4" />
                  Return to Log In
                </Link>
              </div>
            </div>
          )}

          {/* STEP 4: Reset success screen */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-[var(--color-success-muted)] rounded-full flex items-center justify-center mx-auto text-[var(--color-success)] text-3xl">
                ✓
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Password updated successfully! You can now log in using your new credentials.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white tracking-wide transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  Log In Now
                  <HiOutlineArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
