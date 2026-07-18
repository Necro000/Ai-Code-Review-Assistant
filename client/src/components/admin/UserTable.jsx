import { useState } from 'react';
import { HiOutlineTrash, HiOutlineUserCircle, HiOutlineShieldCheck, HiOutlineArrowsRightLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function UserTable({ users = [], onUpdateRole, onDeleteUser, currentUser }) {
  const [isUpdating, setIsUpdating] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (userId === currentUser?.id) {
      toast.error('You cannot change your own admin role');
      return;
    }
    
    setIsUpdating(userId);
    try {
      await onUpdateRole(userId, newRole);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account from the admin dashboard');
      return;
    }

    if (!window.confirm('WARNING: Are you sure you want to delete this user? This will permanently delete their account, all their projects, reviews, and data. This action cannot be undone.')) {
      return;
    }

    setIsDeleting(userId);
    try {
      await onDeleteUser(userId);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
              <th className="py-4 px-6">User</th>
              <th className="py-4 px-6">Role</th>
              <th className="py-4 px-6">Joined Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 px-6 text-center text-xs text-[var(--color-text-muted)]">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const initials = user.name ? user.name[0].toUpperCase() : 'U';
                const isSelf = user.id === currentUser?.id;
                
                return (
                  <tr key={user.id} className="hover:bg-[var(--color-surface-hover)] transition-colors">
                    {/* User Profile */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-accent-muted)] text-[var(--color-accent)] font-semibold text-sm">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--color-text)] flex items-center gap-1.5 leading-none">
                            {user.name}
                            {isSelf && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-[var(--color-accent-muted)] text-[var(--color-accent)] border border-[var(--color-accent)]/20 font-bold uppercase rounded">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        user.role === 'admin' 
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                          : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]'
                      }`}>
                        {user.role === 'admin' ? (
                          <>
                            <HiOutlineShieldCheck className="w-3 h-3" />
                            Admin
                          </>
                        ) : (
                          <>
                            <HiOutlineUserCircle className="w-3 h-3" />
                            User
                          </>
                        )}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-xs text-[var(--color-text-secondary)]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Promote/Demote */}
                        <button
                          onClick={() => handleRoleToggle(user.id, user.role)}
                          disabled={isSelf || isUpdating === user.id}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] border border-transparent hover:border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title={user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          <HiOutlineArrowsRightLeft className="w-4 h-4" />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={isSelf || isDeleting === user.id}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-error-muted)] border border-transparent hover:border-[var(--color-error)]/20 text-[var(--color-text-muted)] hover:text-[var(--color-error)] transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          title="Delete User"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
