import { useState } from 'react';
import { HiOutlineUserMinus, HiOutlineUserPlus, HiOutlineEnvelope } from 'react-icons/hi2';
import { inviteMemberAPI, removeMemberAPI } from '../../api/workspaces';
import toast from 'react-hot-toast';

export default function MemberList({ workspace, currentUser, onRefresh }) {
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(null);

  const isOwner = workspace.ownerId === currentUser?.id;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsInviting(true);
    try {
      const response = await inviteMemberAPI(workspace.id, email);
      toast.success(response.message || 'Member invited successfully');
      setEmail('');
      onRefresh();
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || 'Failed to invite member.';
      toast.error(errMsg);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setIsRemoving(userId);
    try {
      const response = await removeMemberAPI(workspace.id, userId);
      toast.success(response.message || 'Member removed successfully');
      onRefresh();
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || 'Failed to remove member.';
      toast.error(errMsg);
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] space-y-6">
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h3 className="text-base font-bold text-white">Workspace Members</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Manage access to this workspace</p>
        </div>
      </div>

      {/* Invite form */}
      {isOwner && (
        <form onSubmit={handleInvite} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              <HiOutlineEnvelope className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="invitee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <button
            type="submit"
            disabled={isInviting || !email}
            className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex-shrink-0"
          >
            <HiOutlineUserPlus className="w-4 h-4" />
            {isInviting ? 'Inviting...' : 'Invite'}
          </button>
        </form>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {workspace.members?.map((member) => {
          const initials = member.user?.name ? member.user.name[0].toUpperCase() : 'U';
          const isUserOwner = workspace.ownerId === member.user?.id;
          
          return (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold text-xs">
                  {initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white leading-none">
                    {member.user?.name}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                    {member.user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isUserOwner ? (
                  <span className="text-[10px] px-2 py-0.5 bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-bold uppercase rounded-md">
                    Owner
                  </span>
                ) : (
                  <>
                    <span className="text-[10px] px-2 py-0.5 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] font-semibold uppercase rounded-md">
                      Member
                    </span>
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(member.user?.id)}
                        disabled={isRemoving === member.user?.id}
                        className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <HiOutlineUserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
