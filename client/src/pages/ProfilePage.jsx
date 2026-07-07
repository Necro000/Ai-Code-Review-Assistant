import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineArrowRightOnRectangle, HiOutlineCheck, HiOutlineEnvelope } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { updateProfileAPI, changePasswordAPI } from '../api/auth';

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Profile Form
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  // Password Form
  const passwordForm = useForm({
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onUpdateProfile = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const response = await updateProfileAPI(data);
      updateProfile(data); // Sync local state
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

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Profile Settings</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Manage your credentials and personal details.
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-error-muted)] hover:bg-[var(--color-error)] text-[var(--color-error)] hover:text-white rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer"
          style={{ border: '1px solid var(--color-error)' }}
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          Log Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* User Card */}
        <div
          className="md:col-span-1 rounded-2xl border p-6 flex flex-col items-center justify-center text-center glass h-fit"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-4"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <h2 className="text-lg font-bold text-white">{user?.name}</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">{user?.email}</p>
          
          <div
            className="w-full mt-6 pt-6 border-t text-left space-y-3"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Account Status</span>
              <span className="text-[var(--color-success)] font-semibold flex items-center gap-1">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span>Member Since</span>
              <span>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Forms */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Form */}
          <div
            className="rounded-2xl border p-6 glass"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-base font-bold text-white mb-4">Personal Information</h3>
            
            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    {...profileForm.register('name', { required: 'Name is required' })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    {...profileForm.register('email', { required: 'Email is required' })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
                  style={{ background: 'var(--gradient-brand)' }}
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

          {/* Change Password Form */}
          <div
            className="rounded-2xl border p-6 glass"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <h3 className="text-base font-bold text-white mb-4">Security Settings</h3>
            
            <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  {...passwordForm.register('oldPassword', { required: 'Old password is required' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    {...passwordForm.register('newPassword', {
                      required: 'New password is required',
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                        message: 'Must be 8+ characters, with uppercase, lowercase and a number',
                      },
                    })}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs max-w-[280px]" style={{ color: 'var(--color-error)' }}>
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-sm focus:outline-none transition-all duration-200"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                    {...passwordForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === passwordForm.watch('newPassword') || 'Passwords do not match',
                    })}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-xs" style={{ color: 'var(--color-error)' }}>
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 cursor-pointer shadow-lg disabled:opacity-50"
                  style={{ background: 'var(--gradient-brand)' }}
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
