import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlinePlusCircle, HiOutlineCodeBracket, HiOutlineArrowRight } from 'react-icons/hi2';

import StatsCards from '../components/dashboard/StatsCards';
import ScoreTrendLine from '../components/dashboard/ScoreTrendLine';
import SeverityDonut from '../components/dashboard/SeverityDonut';
import LanguageBarChart from '../components/dashboard/LanguageBarChart';
import RecentReviews from '../components/dashboard/RecentReviews';
import { getStatsAPI, listReviewsAPI } from '../api/reviews';

const features = [
  {
    icon: HiOutlineCodeBracket,
    title: 'Static Analysis',
    description: 'Detect syntax errors, unused variables, and style violations using ESLint & Pylint.',
  },
  {
    icon: HiOutlineCodeBracket,
    title: 'AI-Powered Review',
    description: 'Get intelligent feedback on bugs, performance, security, and best practices via Groq LLM.',
  },
  {
    icon: HiOutlineCodeBracket,
    title: 'Complexity Metrics',
    description: 'Cyclomatic complexity, function counts, LOC, and per-function analysis at a glance.',
  },
  {
    icon: HiOutlineCodeBracket,
    title: 'Review History',
    description: 'Every review is saved. Search, filter, and compare past results effortlessly.',
  },
];

export default function DashboardPage() {
  // Query: Fetch dashboard stats
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await getStatsAPI();
      return response.data.stats;
    },
  });

  // Query: Fetch recent reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['recentReviews'],
    queryFn: async () => {
      const response = await listReviewsAPI({ page: 1, limit: 5 });
      return response.data.reviews;
    },
  });

  const isLoading = isLoadingStats || isLoadingReviews;
  const reviews = reviewsData || [];
  const stats = statsData || {};

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-[var(--color-surface)] rounded" />
            <div className="h-4 w-60 bg-[var(--color-surface)] rounded" />
          </div>
          <div className="h-10 w-28 bg-[var(--color-surface)] rounded-xl" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5" />
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
      </div>
    );
  }

  const hasReviews = reviews.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Welcome back! Here&apos;s an overview of your code reviews.
          </p>
        </div>
        <Link
          to="/review/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer shadow-lg"
          style={{
            background: 'var(--gradient-brand)',
            boxShadow: 'var(--shadow-glow)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
          }}
        >
          <HiOutlinePlusCircle className="w-5 h-5" />
          New Review
        </Link>
      </div>

      {/* Stats Section */}
      <StatsCards stats={stats} />

      {hasReviews ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Recent Reviews Table */}
            <div className="lg:col-span-2">
              <RecentReviews reviews={reviews} />
            </div>

            {/* Performance Line Chart */}
            <div className="lg:col-span-1">
              <ScoreTrendLine trend={stats.scoreTrend} />
            </div>
          </div>

          {/* Finding severity and language bar distribution metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SeverityDonut breakdown={stats.severityBreakdown} />
            <LanguageBarChart breakdown={stats.languageBreakdown} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="rounded-xl border p-8 text-center bg-[var(--color-surface)] border-[var(--color-border)]"
        >
          <div
            className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
          >
            <HiOutlineCodeBracket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-white">No reviews yet</h2>
          <p className="mt-2 text-sm max-w-md mx-auto text-[var(--color-text-secondary)]">
            Start your first code review by pasting a code snippet or uploading a source file. Our AI will analyze it in seconds.
          </p>
          <Link
            to="/review/new"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 cursor-pointer"
            style={{ background: 'var(--gradient-brand)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Start First Review
            <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Features Explainers */}
      <div>
        <h2 className="text-base font-semibold text-white mb-4">Core Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-5 rounded-xl border bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-hover)] transition-all duration-300 cursor-default"
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0 mb-3 transition-colors duration-200 bg-[var(--color-accent-muted)] group-hover:bg-[var(--color-accent-glow)]"
                >
                  <Icon className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
