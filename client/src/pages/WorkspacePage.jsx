import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listWorkspacesAPI, createWorkspaceAPI } from '../api/workspaces';
import WorkspaceCard from '../components/workspace/WorkspaceCard';
import { HiOutlineUserGroup, HiOutlinePlus, HiOutlineXMark, HiOutlineSparkles } from 'react-icons/hi2';
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
    mutationFn: async (wsName) => createWorkspaceAPI(wsName),
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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b pb-5" style={{ borderColor: 'var(--color-border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <span
              className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
            >
              <HiOutlineUserGroup className="w-5 h-5 text-white" />
            </span>
            Workspaces
          </h1>
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Collaborate on projects and share code reviews with your team
          </p>
        </div>

        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
            showCreateForm ? '' : 'text-white'
          }`}
          style={
            showCreateForm
              ? {
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }
              : { background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }
          }
        >
          {showCreateForm ? (
            <>
              <HiOutlineXMark className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <HiOutlinePlus className="w-4 h-4" />
              New Workspace
            </>
          )}
        </button>
      </div>

      {/* Inline Create Form */}
      {showCreateForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl border glass flex flex-col sm:flex-row gap-4 items-end animate-fade-in-scale"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              Workspace Name
            </label>
            <input
              type="text"
              placeholder="e.g. Acme Engineering Team"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all duration-200"
              style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-accent)';
                e.target.style.boxShadow = '0 0 0 3px var(--color-accent-muted)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setShowCreateForm(false); setName(''); }}
              className="btn-secondary flex-1 sm:flex-initial px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="btn-primary flex-1 sm:flex-initial px-5 py-2.5 text-xs"
            >
              {createMutation.isPending ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <HiOutlinePlus className="w-4 h-4" />
                  Create
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && workspaces.length === 0 && (
        <div
          className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed space-y-5"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'rgba(26, 37, 64, 0.3)' }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 rounded-2xl animate-float"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlineUserGroup className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No workspaces yet</h3>
            <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Create a workspace to invite your team and collaborate on code reviews in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary px-5 py-2.5 text-sm"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Create First Workspace
            </button>
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'var(--color-accent-muted)',
                color: 'var(--color-accent-hover)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <HiOutlineSparkles className="w-3.5 h-3.5" />
              Real-time collaboration
            </div>
          </div>
        </div>
      )}

      {/* Workspaces Grid */}
      {!isLoading && workspaces.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Your Workspaces
            </span>
            <span className="badge badge-accent">{workspaces.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace, i) => (
              <div
                key={workspace.id}
                className="animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <WorkspaceCard workspace={workspace} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
