import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminStatsAPI, listUsersAPI, updateUserRoleAPI, deleteUserAPI } from '../api/admin';
import UserTable from '../components/admin/UserTable';
import ScoreBadge from '../components/review/ScoreBadge';
import useAuth from '../hooks/useAuth';
import { HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineFolder, HiOutlineChartBar, HiOutlineCpuChip } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [page, setPage] = useState(1);
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Query: Stats
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getAdminStatsAPI,
  });

  // Query: Users (Paginated)
  const { data: usersData, isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsers', page],
    queryFn: () => listUsersAPI(page, 10),
  });

  // Mutation: Update Role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => {
      return await updateUserRoleAPI(userId, role);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'User role updated successfully');
      queryClient.invalidateQueries(['adminUsers']);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to update user role.';
      toast.error(errMsg);
    },
  });

  // Mutation: Delete User
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await deleteUserAPI(userId);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'User deleted successfully');
      queryClient.invalidateQueries(['adminUsers']);
      queryClient.invalidateQueries(['adminStats']);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to delete user.';
      toast.error(errMsg);
    },
  });

  const handleUpdateRole = async (userId, role) => {
    await updateRoleMutation.mutateAsync({ userId, role });
  };

  const handleDeleteUser = async (userId) => {
    await deleteUserMutation.mutateAsync(userId);
  };

  const stats = statsData?.data?.stats;
  const users = usersData?.data?.users || [];
  const meta = usersData?.meta || { page: 1, totalPages: 1 };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <HiOutlineCpuChip className="text-[var(--color-accent)]" />
            System Administration
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Monitor system-wide metrics and manage user access permissions
          </p>
        </div>
      </div>

      {/* Platform Stats */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          <div className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
          <div className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
          <div className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
          <div className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="rounded-xl p-5 border bg-[var(--color-surface)] border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total Users</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{stats?.totalUsers ?? 0}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-accent-muted)]">
              <HiOutlineUserGroup className="w-5 h-5 text-[var(--color-accent)]" />
            </div>
          </div>

          {/* Total Projects */}
          <div className="rounded-xl p-5 border bg-[var(--color-surface)] border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total Projects</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{stats?.totalProjects ?? 0}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
              <HiOutlineFolder className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          {/* Total Reviews */}
          <div className="rounded-xl p-5 border bg-[var(--color-surface)] border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Total Reviews</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{stats?.totalReviews ?? 0}</p>
            </div>
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/10">
              <HiOutlineDocumentText className="w-5 h-5 text-sky-500" />
            </div>
          </div>

          {/* Average Quality Score */}
          <div className="rounded-xl p-5 border bg-[var(--color-surface)] border-[var(--color-border)] flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Global Avg Score</p>
              <p className="mt-2 text-2xl font-bold text-[var(--color-text)]">{stats?.averageScore ? `${stats.averageScore}/100` : 'N/A'}</p>
            </div>
            {stats?.averageScore ? (
              <ScoreBadge score={stats.averageScore} size={48} />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/10">
                <HiOutlineChartBar className="w-5 h-5 text-amber-500" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Management Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[var(--color-text)]">Registered Platform Users</h3>
        {isUsersLoading ? (
          <div className="h-64 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
        ) : (
          <UserTable
            users={users}
            currentUser={currentUser}
            onUpdateRole={handleUpdateRole}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {/* Pagination controls */}
        {!isUsersLoading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-muted)]">
              Page {meta.page} of {meta.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white disabled:opacity-30 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white disabled:opacity-30 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
