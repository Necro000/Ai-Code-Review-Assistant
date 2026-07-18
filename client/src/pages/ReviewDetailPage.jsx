import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineTrash } from 'react-icons/hi2';

import ReviewHeader from '../components/review/ReviewHeader';
import ComplexityPanel from '../components/review/ComplexityPanel';
import CodeDisplay from '../components/review/CodeDisplay';
import FindingsList from '../components/review/FindingsList';
import RefactoringPanel from '../components/review/RefactoringPanel';
import { getReviewAPI, deleteReviewAPI } from '../api/reviews';
import useCollaboration from '../hooks/useCollaboration';
import CollaboratorsBar from '../components/review/CollaboratorsBar';

export default function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [highlightedLine, setHighlightedLine] = useState(null);
  const collaborators = useCollaboration(id);

  // Query: Fetch review details
  const { data: reviewData, isLoading, error } = useQuery({
    queryKey: ['review', id],
    queryFn: async () => {
      const response = await getReviewAPI(id);
      return response.data.review;
    },
  });

  // Mutation: Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      return await deleteReviewAPI(id);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Review deleted successfully');
      queryClient.invalidateQueries(['reviews']);
      queryClient.invalidateQueries(['dashboardStats']);
      navigate('/dashboard');
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete review.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReviewMutation.mutate();
    }
  };

  const handleLineJump = (lineNum) => {
    setHighlightedLine(lineNum);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-24 bg-[var(--color-surface)] rounded-xl" />
        <div className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
        <div className="h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
          <div className="lg:col-span-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
          <div className="lg:col-span-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <p className="text-lg font-bold text-[var(--color-text)]">Review report not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] rounded-xl text-sm font-semibold text-[var(--color-text)]"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const review = reviewData;
  const refactoringTips = (review.findings || []).filter((f) => f.rule === 'refactoring-tip');
  const codeFindings = (review.findings || []).filter((f) => f.rule !== 'refactoring-tip');

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b pb-4 border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] transition-all duration-200 cursor-pointer"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back
          </button>
          <CollaboratorsBar users={collaborators} />
        </div>

        <button
          onClick={handleDelete}
          disabled={deleteReviewMutation.isPending}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--color-error)] bg-[var(--color-error-muted)] hover:bg-[var(--color-error)] hover:text-white border border-[var(--color-error)] transition-all duration-200 cursor-pointer"
        >
          <HiOutlineTrash className="w-4 h-4" />
          Delete Report
        </button>
      </div>

      {/* Radial score progress details & summary */}
      <ReviewHeader review={review} />

      {/* Cyclomatic & structural metrics */}
      <ComplexityPanel code={review.codeContent || ''} language={review.language || ''} />

      {/* Code Display & Findings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Code Visualizer */}
        <div className="lg:col-span-2">
          <CodeDisplay
            code={review.codeContent || ''}
            language={review.language || ''}
            highlightedLine={highlightedLine}
          />
        </div>

        {/* Issue Cards */}
        <div className="lg:col-span-1">
          <FindingsList findings={codeFindings} onJump={handleLineJump} />
        </div>
      </div>

      {/* AI Refactoring Suggestions */}
      <RefactoringPanel tips={refactoringTips} />
    </div>
  );
}
