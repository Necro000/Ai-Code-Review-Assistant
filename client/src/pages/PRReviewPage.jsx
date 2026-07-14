import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listProjectsAPI } from '../api/analysis';
import { reviewPRAPI } from '../api/pr';
import { HiOutlineArrowRight, HiOutlineCodeBracketSquare, HiOutlineDocumentCheck, HiOutlineSparkles } from 'react-icons/hi2';
import ScoreBadge from '../components/review/ScoreBadge';
import toast from 'react-hot-toast';

export default function PRReviewPage() {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [pullNumber, setPullNumber] = useState('');
  const [projectId, setProjectId] = useState('');
  const [results, setResults] = useState(null);

  // Query: User Projects
  const { data: projectsData, isLoading: isProjectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjectsAPI,
  });

  // Mutation: Submit PR Review
  const reviewPRMutation = useMutation({
    mutationFn: reviewPRAPI,
    onSuccess: (res) => {
      toast.success(res.message || 'Pull request review completed!');
      setResults(res.data);
    },
    onError: (err) => {
      const errMsg = err.response?.data?.error?.message || 'Failed to analyze pull request.';
      toast.error(errMsg);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!owner || !repo || !pullNumber || !projectId) {
      toast.error('All fields are required');
      return;
    }
    setResults(null);
    reviewPRMutation.mutate({ owner, repo, pullNumber, projectId });
  };

  const projects = projectsData?.data?.projects || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HiOutlineCodeBracketSquare className="text-[var(--color-accent)]" />
            GitHub PR Review
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Submit a public GitHub Pull Request to analyze all modified files.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form panel */}
        <div className="lg:col-span-1 rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] space-y-4">
          <h3 className="text-sm font-bold text-white">Review Request Settings</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Target Project
              </label>
              <select
                disabled={isProjectsLoading || reviewPRMutation.isPending}
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--color-bg-secondary)] border rounded-xl text-xs focus:outline-none transition-all duration-200"
                style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="">Select a project...</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.projectName}
                  </option>
                ))}
              </select>
            </div>

            {/* Repository Owner */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Repository Owner / Org
              </label>
              <input
                type="text"
                placeholder="e.g. octocat"
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
                placeholder="e.g. hello-world"
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
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 transition-all cursor-pointer shadow-md"
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
            <div className="rounded-2xl border p-8 bg-[var(--color-surface)] border-[var(--color-border)] flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-full h-full border-4 border-[var(--color-accent-muted)] border-t-[var(--color-accent)] rounded-full animate-spin" />
                <HiOutlineCodeBracketSquare className="w-5 h-5 text-[var(--color-accent)] animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white animate-pulse">Running Code Analysis Engine</h4>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">
                  Fetching changed files, triggering multi-language static analysis linters, and coordinating senior AI review metrics...
                </p>
              </div>
            </div>
          )}

          {!reviewPRMutation.isPending && !results && (
            <div className="rounded-2xl border p-8 bg-[var(--color-surface)] border-[var(--color-border)] text-center py-16 flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
                <HiOutlineCodeBracketSquare className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ready for Analysis</h4>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Configure repository credentials on the left and trigger analysis.
                </p>
              </div>
            </div>
          )}

          {results && (
            <div className="rounded-2xl border p-6 bg-[var(--color-surface)] border-[var(--color-border)] space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b pb-4 border-[var(--color-border)]">
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
                      <p className="text-xs font-bold text-white truncate max-w-md">
                        {rev.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-muted)]">
                        <span className="capitalize px-1.5 py-0.2 bg-[var(--color-bg-tertiary)] rounded font-medium">
                          {rev.language}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <ScoreBadge score={rev.overallScore} size={48} />
                      <Link
                        to={`/review/${rev.reviewId}`}
                        className="px-3 py-1.5 bg-[var(--color-surface-hover)] hover:bg-[var(--color-surface-active)] text-[var(--color-accent-hover)] hover:text-white border border-[var(--color-border)] hover:border-[var(--color-accent)] font-semibold text-[10px] rounded-lg transition-all"
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
