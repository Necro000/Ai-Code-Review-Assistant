import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  HiOutlineUser,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
  HiOutlineCheck,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
  HiOutlinePencilSquare,
  HiOutlineCalendarDays,
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { updateProfileAPI, changePasswordAPI } from '../api/auth';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const initials = user?.name ? user.name[0].toUpperCase() : 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
    : 'N/A';

  // Profile Form
  const profileForm = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', avatarUrl: user?.avatarUrl || '' },
  });

  // Password Form
  const passwordForm = useForm({
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const response = await updateProfileAPI(data);
      updateProfile(data);
      toast.success(response.message || 'Profile details updated.');
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to update profile details.';
      toast.error(errorMsg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setIsUpdatingPassword(true);
    try {
      const response = await changePasswordAPI(data.oldPassword, data.newPassword);
      toast.success(response.message || 'Password changed successfully!');
      passwordForm.reset();
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || 'Failed to update password.';
      toast.error(errorMsg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const inputStyle = (hasError) => ({
    backgroundColor: 'var(--color-bg-secondary)',
    border: `1px solid ${hasError ? 'var(--color-error)' : 'var(--color-border)'}`,
    color: 'var(--color-text)',
  });

  const inputClass = 'w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200';

  const onInputFocus = (e, hasError) => {
    if (!hasError) e.target.style.borderColor = 'var(--color-accent)';
    e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
  };

  const onInputBlur = (e, hasError) => {
    e.target.style.borderColor = hasError ? 'var(--color-error)' : 'var(--color-border)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Profile Settings</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage your account credentials and personal information.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-error-muted)',
            color: 'var(--color-error)',
            border: '1px solid rgba(239,68,68,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error)';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-error-muted)';
            e.currentTarget.style.color = 'var(--color-error)';
          }}
        >
          <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div
          className="md:col-span-1 rounded-2xl border p-6 flex flex-col items-center text-center glass h-fit space-y-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Avatar */}
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
                className="w-20 h-20 rounded-full object-cover border-2 border-[var(--color-border)] shadow-xl animate-pulse-glow"
              />
            ) : null}
            <div
              className="w-20 h-20 rounded-full items-center justify-center text-3xl font-black text-white animate-pulse-glow"
              style={{
                display: user?.avatarUrl ? 'none' : 'flex',
                background: 'var(--gradient-brand)',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              {initials}
            </div>
            {/* Online indicator */}
            <span
              className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: 'var(--color-success)',
                borderColor: 'var(--color-bg-secondary)',
              }}
            />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{user?.name || 'Unknown'}</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</p>
          </div>

          {/* Stat Badges */}
          <div className="w-full space-y-2.5 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <HiOutlineShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--color-success)' }} />
                Account Status
              </div>
              <span className="badge badge-success">Active</span>
            </div>

            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <HiOutlineCalendarDays className="w-3.5 h-3.5" style={{ color: 'var(--color-accent-hover)' }} />
                Member Since
              </div>
              <span className="text-xs font-semibold text-white">{memberSince}</span>
            </div>

            <div
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{ backgroundColor: 'var(--color-surface)' }}
            >
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub Auth
              </div>
              {user?.githubId ? (
                <span className="badge badge-success">Connected</span>
              ) : (
                <span className="badge" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text-muted)' }}>Not Connected</span>
              )}
            </div>

            {user?.role && (
              <div
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: 'var(--color-surface)' }}
              >
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  <HiOutlineUser className="w-3.5 h-3.5" style={{ color: 'var(--color-warning)' }} />
                  Role
                </div>
                <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-accent'} capitalize`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <div
            className="rounded-2xl border p-6 glass"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <HiOutlinePencilSquare className="w-4 h-4" style={{ color: 'var(--color-accent-hover)' }} />
              <h3 className="text-sm font-bold text-white">Personal Information</h3>
            </div>

            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    style={inputStyle(!!profileForm.formState.errors.name)}
                    onFocus={(e) => onInputFocus(e, !!profileForm.formState.errors.name)}
                    onBlur={(e) => onInputBlur(e, !!profileForm.formState.errors.name)}
                    {...profileForm.register('name', { required: 'Name is required' })}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      ⚠ {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    style={inputStyle(!!profileForm.formState.errors.email)}
                    onFocus={(e) => onInputFocus(e, !!profileForm.formState.errors.email)}
                    onBlur={(e) => onInputBlur(e, !!profileForm.formState.errors.email)}
                    {...profileForm.register('email', { required: 'Email is required' })}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      ⚠ {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Profile Picture URL (Avatar)
                </label>
                <input
                  type="url"
                  placeholder="https://avatars.githubusercontent.com/u/..."
                  className={inputClass}
                  style={inputStyle(false)}
                  onFocus={(e) => onInputFocus(e, false)}
                  onBlur={(e) => onInputBlur(e, false)}
                  {...profileForm.register('avatarUrl')}
                />
                <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
                  GitHub profile pictures are updated automatically when logging in with GitHub.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  {isUpdatingProfile ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Save Details
                      <HiOutlineCheck className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Security Settings */}
          <div
            className="rounded-2xl border p-6 glass"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <HiOutlineLockClosed className="w-4 h-4" style={{ color: 'var(--color-warning)' }} />
              <h3 className="text-sm font-bold text-white">Security Settings</h3>
            </div>

            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={inputClass}
                  style={inputStyle(!!passwordForm.formState.errors.oldPassword)}
                  onFocus={(e) => onInputFocus(e, !!passwordForm.formState.errors.oldPassword)}
                  onBlur={(e) => onInputBlur(e, !!passwordForm.formState.errors.oldPassword)}
                  {...passwordForm.register('oldPassword', { required: 'Old password is required' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={inputClass}
                    style={inputStyle(!!passwordForm.formState.errors.newPassword)}
                    onFocus={(e) => onInputFocus(e, !!passwordForm.formState.errors.newPassword)}
                    onBlur={(e) => onInputBlur(e, !!passwordForm.formState.errors.newPassword)}
                    {...passwordForm.register('newPassword', {
                      required: 'New password is required',
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                        message: 'Must be 8+ chars with uppercase, lowercase & number',
                      },
                    })}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs max-w-[280px]" style={{ color: 'var(--color-error)' }}>
                      ⚠ {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={inputClass}
                    style={inputStyle(!!passwordForm.formState.errors.confirmPassword)}
                    onFocus={(e) => onInputFocus(e, !!passwordForm.formState.errors.confirmPassword)}
                    onBlur={(e) => onInputBlur(e, !!passwordForm.formState.errors.confirmPassword)}
                    {...passwordForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === passwordForm.watch('newPassword') || 'Passwords do not match',
                    })}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      ⚠ {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="btn-primary px-5 py-2.5 text-sm"
                >
                  {isUpdatingPassword ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Change Password
                      <HiOutlineLockClosed className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
