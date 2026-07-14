import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listWorkspacesAPI, createWorkspaceAPI } from '../api/workspaces';
import WorkspaceCard from '../components/workspace/WorkspaceCard';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineCpuChip } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function WorkspacePage() {
  const [name, setName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: listWorkspacesAPI,
  });

  const createMutation = useMutation({
    mutationFn: async (wsName) => {
      return await createWorkspaceAPI(wsName);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Workspace created successfully');
      queryClient.invalidateQueries(['workspaces']);
      setName('');
      setShowCreateForm(false);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to create workspace.';
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate(name);
  };

  const workspaces = data?.data?.workspaces || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-bold text-white">Workspaces</h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Collaborate on projects with your team members
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-md"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Create Workspace
        </button>
      </div>

      {/* Inline Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl border bg-[var(--color-surface)] border-[var(--color-border)] flex flex-col sm:flex-row gap-4 items-end animate-fade-in"
        >
          <div className="flex-1 space-y-2 w-full">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Workspace Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-accent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-white hover:bg-[var(--color-surface-active)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
          <div className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
          <div className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workspaces.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-dashed border-[var(--color-border)] bg-[rgba(30,41,59,0.1)] space-y-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
            <HiOutlineUserGroup className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No workspaces yet</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Create a workspace to invite your team and share code reviews
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Create First Workspace
          </button>
        </div>
      )}

      {/* Workspaces Grid */}
      {!isLoading && workspaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
}
