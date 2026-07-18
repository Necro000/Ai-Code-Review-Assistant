import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkspaceAPI, deleteWorkspaceAPI } from '../api/workspaces';
import MemberList from '../components/workspace/MemberList';
import useAuth from '../hooks/useAuth';
import { HiOutlineArrowLeft, HiOutlineTrash, HiOutlineFolderOpen, HiOutlineDocumentText } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['workspace', id],
    queryFn: () => getWorkspaceAPI(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkspaceAPI(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Workspace deleted successfully');
      queryClient.invalidateQueries(['workspaces']);
      navigate('/workspace');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to delete workspace.';
      toast.error(errMsg);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this workspace? All member relationships will be deleted. Projects will persist.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-24 bg-[var(--color-surface)] rounded-xl" />
        <div className="h-32 bg-[var(--color-surface)] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 bg-[var(--color-surface)] rounded-2xl" />
          <div className="lg:col-span-1 bg-[var(--color-surface)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data?.data?.workspace) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <p className="text-lg font-bold text-[var(--color-text)]">Workspace not found.</p>
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl text-sm font-semibold text-[var(--color-text)]"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Workspaces
        </button>
      </div>
    );
  }

  const workspace = data.data.workspace;
  const isOwner = workspace.ownerId === currentUser?.id;

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <button
          onClick={() => navigate('/workspace')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to Workspaces
        </button>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-error)] bg-[var(--color-error-muted)] hover:bg-[var(--color-error)] hover:text-white border border-[var(--color-error)] transition-all duration-200 cursor-pointer"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Delete Workspace
          </button>
        )}
      </div>

      {/* Banner */}
      <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] space-y-2">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">{workspace.name}</h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Owned by <strong className="text-[var(--color-text-secondary)]">{workspace.owner?.name}</strong> ({workspace.owner?.email})
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Workspace Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
              <HiOutlineFolderOpen className="w-5 h-5 text-[var(--color-accent)]" />
              Workspace Projects ({workspace.projects?.length || 0})
            </div>
            
            {workspace.projects?.length === 0 ? (
              <p className="text-xs text-[var(--color-text-muted)] py-4">
                No projects associated with this workspace yet. Connect a project to get started.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {workspace.projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--color-text)]">{proj.projectName}</h4>
                      {proj.githubUrl && (
                        <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[var(--color-accent-hover)] hover:underline truncate block mt-1">
                          {proj.githubUrl}
                        </a>
                      )}
                    </div>

                    <div className="border-t border-[var(--color-border)] pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Recent Reviews</p>
                      {proj.reviews?.length === 0 ? (
                        <p className="text-[10px] text-[var(--color-text-muted)]">No reviews yet.</p>
                      ) : (
                        <div className="space-y-1">
                          {proj.reviews.map((rev) => (
                            <Link key={rev.id} to={`/review/${rev.id}`} className="flex items-center justify-between p-1.5 rounded bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-active)] transition-colors text-[10px]">
                              <span className="text-[var(--color-text-secondary)] font-medium truncate max-w-[120px]">
                                {new Date(rev.createdAt).toLocaleDateString()} ({rev.language})
                              </span>
                              <span className="font-bold text-[var(--color-text)]">
                                {rev.overallScore}%
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Member Management Panel */}
        <div className="lg:col-span-1">
          <MemberList workspace={workspace} currentUser={currentUser} onRefresh={refetch} />
        </div>
      </div>
    </div>
  );
}
