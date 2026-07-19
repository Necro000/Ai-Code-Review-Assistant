import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listProjectsAPI, createProjectAPI } from '../api/analysis';
import { reviewPRAPI } from '../api/pr';
import { HiOutlineArrowRight, HiOutlineCodeBracketSquare, HiOutlineDocumentCheck, HiOutlinePlus } from 'react-icons/hi2';
import ScoreBadge from '../components/review/ScoreBadge';
import toast from 'react-hot-toast';

export default function PRReviewPage() {
  const queryClient = useQueryClient();
  const [prUrl, setPrUrl] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [pullNumber, setPullNumber] = useState('');
  const [projectId, setProjectId] = useState('');
  const [results, setResults] = useState(null);

  // New Project Inline Creation State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Auto-parse PR URL when pasted
  const handlePrUrlChange = (val) => {
    setPrUrl(val);
    const match = val.trim().match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
    if (match) {
      setOwner(match[1]);
      setRepo(match[2]);
      setPullNumber(match[3]);
    }
  };

  // Query: User Projects
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjectsAPI,
  });

  // Mutation: Create Project
  const createProjectMutation = useMutation({
    mutationFn: (projectName) => createProjectAPI({ projectName }),
    onSuccess: (res) => {
      toast.success(res.message || 'Project created!');
      queryClient.invalidateQueries(['projects']);
      setProjectId(res.data.project.id);
      setIsCreatingProject(false);
      setNewProjectName('');
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to create project.';
      toast.error(errMsg);
    },
  });

  // Mutation: Submit PR Review
  const reviewPRMutation = useMutation({
    mutationFn: reviewPRAPI,
    onSuccess: (res) => {
      toast.success(res.message || 'Pull request review completed!');
      setResults(res.data);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to analyze pull request. Check repository name and PR number.';
      toast.error(errMsg);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!prUrl && (!owner || !repo || !pullNumber)) {
      toast.error('Please enter a GitHub PR URL or specify Owner, Repo, and PR Number.');
      return;
    }

    let targetProjectId = projectId;

    // Auto-create project if new user hasn't selected or created one yet
    if (!targetProjectId) {
      try {
        const autoName = repo ? `${repo} PRs` : 'My PR Reviews';
        const newProjRes = await createProjectAPI({ projectName: autoName });
        targetProjectId = newProjRes.data.project.id;
        setProjectId(targetProjectId);
        queryClient.invalidateQueries(['projects']);
        toast.success(`Created project "${autoName}" for your reviews!`);
      } catch (err) {
        toast.error('Please select or create a Target Project.');
        return;
      }
    }

    setResults(null);
    reviewPRMutation.mutate({
      prUrl: prUrl.trim() || undefined,
      owner: owner.trim() || undefined,
      repo: repo.trim() || undefined,
      pullNumber: pullNumber ? parseInt(pullNumber, 10) : undefined,
      projectId: targetProjectId,
    });
  };

  const handleCreateProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }
    createProjectMutation.mutate(newProjectName.trim());
  };

  const projects = projectsData?.data?.projects || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--color-text)] flex items-center gap-2">
            <HiOutlineCodeBracketSquare className="text-[var(--color-accent)]" />
            GitHub PR Review
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Submit a public GitHub Pull Request to analyze all modified code files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form panel */}
        <div className="lg:col-span-1 rounded-2xl border p-6 glass border-[var(--color-border)] space-y-4">
          <h2 className="text-sm font-bold text-[var(--color-text)]">Review Request Settings</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Select / Create */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  Target Project
                </label>
                {!isCreatingProject && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingProject(true)}
                    className="text-[11px] font-semibold flex items-center gap-1 hover:underline text-[var(--color-accent-hover)]"
                  >
                    <HiOutlinePlus className="w-3 h-3" />
                    New Project
                  </button>
                )}
              </div>

              {isCreatingProject ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Project name (e.g. Portfolio)"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none text-[var(--color-text)]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateProjectSubmit}
                      disabled={createProjectMutation.isPending}
                      className="flex-1 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProject(false)}
                      className="flex-1 py-1.5 bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  disabled={isProjectsLoading || reviewPRMutation.isPending}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200 cursor-pointer"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                  <option value="">Select a project...</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* GitHub PR URL Quick Paste */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                GitHub PR URL (Quick Paste)
              </label>
              <input
                type="url"
                placeholder="https://github.com/facebook/react/pull/28000"
                disabled={reviewPRMutation.isPending}
                value={prUrl}
                onChange={(e) => handlePrUrlChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            <div className="relative flex items-center gap-2 py-0.5">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">OR Enter Details</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {/* Repository Owner */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Repository Owner / Org
              </label>
              <input
                type="text"
                placeholder="e.g. octocat or facebook"
                disabled={reviewPRMutation.isPending}
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Repository Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Repository Name
              </label>
              <input
                type="text"
                placeholder="e.g. hello-world or react"
                disabled={reviewPRMutation.isPending}
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            {/* PR Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Pull Request Number
              </label>
              <input
                type="number"
                placeholder="e.g. 42"
                disabled={reviewPRMutation.isPending}
                value={pullNumber}
                onChange={(e) => setPullNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={reviewPRMutation.isPending || isProjectsLoading}
              className="btn-primary w-full py-3 text-xs tracking-wide"
            >
              {reviewPRMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Files...
                </>
              ) : (
                <>
                  Analyze PR
                  <HiOutlineArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {reviewPRMutation.isPending && (
            <div className="rounded-2xl border p-8 glass border-[var(--color-border)] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-full h-full border-4 border-[var(--color-accent-muted)] border-t-[var(--color-accent)] rounded-full animate-spin" />
                <HiOutlineCodeBracketSquare className="w-5 h-5 text-[var(--color-accent)] animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)] animate-pulse">Running Code Analysis Engine</h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">
                  Fetching changed files, triggering multi-language static analysis linters, and coordinating AI review metrics...
                </p>
              </div>
            </div>
          )}

          {!reviewPRMutation.isPending && !results && (
            <div className="rounded-2xl border p-8 glass border-[var(--color-border)] text-center py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                <HiOutlineCodeBracketSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">Ready for Analysis</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
                  Configure repository credentials on the left and trigger your pull request review.
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className="rounded-2xl border p-6 glass border-[var(--color-border)] space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)] border-b pb-4 border-[var(--color-border)]">
                <HiOutlineDocumentCheck className="w-5 h-5 text-emerald-500" />
                PR Review Completed — {results.filesReviewed} file(s) analyzed
              </div>

              <div className="space-y-3">
                {results.reviews?.map((rev) => (
                  <div
                    key={rev.reviewId}
                    className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[var(--color-text)] truncate max-w-md">
                        {rev.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span className="capitalize px-2 py-0.5 bg-[var(--color-bg-tertiary)] rounded-md font-medium text-[var(--color-text-secondary)]">
                          {rev.language}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <ScoreBadge score={rev.overallScore} size={48} />
                      <Link
                        to={`/review/${rev.reviewId}`}
                        className="px-3.5 py-1.5 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-accent-hover)] font-semibold text-xs rounded-xl border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-all"
                      >
                        View Report &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
