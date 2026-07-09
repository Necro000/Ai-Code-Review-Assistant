import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineArrowLeft, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

import ReviewCard from '../components/review/ReviewCard';
import { searchReviewsAPI, deleteReviewAPI } from '../api/reviews';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [severity, setSeverity] = useState('');
  const [reviewType, setReviewType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 6;

  // Debounce search query text input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1); // reset to page 1 on new searches
    }, 400);

    return () => clearTimeout(handler);
  }, [q]);

  // Query: Fetch reviews list based on filters
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['history', debouncedQ, severity, reviewType, page],
    queryFn: async () => {
      const response = await searchReviewsAPI({
        q: debouncedQ,
        severity,
        reviewType,
        page,
        limit,
      });
      return response;
    },
  });

  // Mutation: Delete review
  const deleteReviewMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteReviewAPI(id);
    },
    onSuccess: (response) => {
      toast.success(response.message || 'Review deleted successfully');
      queryClient.invalidateQueries(['history']);
      queryClient.invalidateQueries(['dashboardStats']);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.error?.message || 'Failed to delete review.';
      toast.error(errorMsg);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      deleteReviewMutation.mutate(id);
    }
  };

  const reviews = historyData?.data?.reviews || [];
  const meta = historyData?.meta || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Review History</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Search, filter, and inspect your past code review reports.
        </p>
      </div>

      {/* Filter Options Bar */}
      <div
        className="rounded-xl border p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 bg-[var(--color-surface)] border-[var(--color-border)]"
      >
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
            <HiOutlineMagnifyingGlass className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search by summary, project name, language..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-accent)]"
            style={{ color: 'var(--color-text)' }}
          />
        </div>

        {/* Filters Selects */}
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          {/* Severity Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 pr-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent)] cursor-pointer text-white"
            >
              <option value="">All Severities</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
            </select>
          </div>

          {/* Type Select */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={reviewType}
              onChange={(e) => {
                setReviewType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 pr-8 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:border-[var(--color-accent)] cursor-pointer text-white"
            >
              <option value="">All Review Types</option>
              <option value="combined">Combined</option>
              <option value="static_only">Static Only</option>
              <option value="ai_only">AI Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Review List block */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center bg-[rgba(10,14,26,0.15)] border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-muted)]">No reviews found matching filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            Showing page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong> ({meta.total} results)
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-white hover:bg-[var(--color-surface-hover)] disabled:opacity-30 cursor-pointer"
            >
              <HiOutlineChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages}
              className="p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-white hover:bg-[var(--color-surface-hover)] disabled:opacity-30 cursor-pointer"
            >
              <HiOutlineChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
