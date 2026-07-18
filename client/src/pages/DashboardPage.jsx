import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineShieldCheck,
  HiOutlineCpuChip,
  HiOutlineChartBar,
  HiOutlineBookOpen,
  HiOutlineCodeBracket,
  HiOutlineSparkles,
} from 'react-icons/hi2';

import StatsCards from '../components/dashboard/StatsCards';
import ScoreTrendLine from '../components/dashboard/ScoreTrendLine';
import SeverityDonut from '../components/dashboard/SeverityDonut';
import LanguageBarChart from '../components/dashboard/LanguageBarChart';
import RecentReviews from '../components/dashboard/RecentReviews';
import { getStatsAPI, listReviewsAPI } from '../api/reviews';
import useAuth from '../hooks/useAuth';

const features = [
  {
    icon: HiOutlineShieldCheck,
    title: 'Static Analysis',
    description: 'Detect syntax errors, unused variables, and style violations using ESLint & Pylint.',
    color: 'var(--color-success)',
    colorMuted: 'var(--color-success-muted)',
  },
  {
    icon: HiOutlineSparkles,
    title: 'AI-Powered Review',
    description: 'Get intelligent feedback on bugs, performance, security, and best practices via Groq LLM.',
    color: 'var(--color-accent-hover)',
    colorMuted: 'var(--color-accent-muted)',
  },
  {
    icon: HiOutlineCpuChip,
    title: 'Complexity Metrics',
    description: 'Cyclomatic complexity, function counts, LOC, and per-function analysis at a glance.',
    color: 'var(--color-warning)',
    colorMuted: 'var(--color-warning-muted)',
  },
  {
    icon: HiOutlineBookOpen,
    title: 'Review History',
    description: 'Every review is saved. Search, filter, and compare past results effortlessly.',
    color: 'var(--color-info)',
    colorMuted: 'var(--color-info-muted)',
  },
];

const quickActions = [
  { label: 'New Code Review', to: '/review/new', icon: HiOutlineCodeBracket },
  { label: 'Review History', to: '/history', icon: HiOutlineChartBar },
  { label: 'PR Review', to: '/pr/review', icon: HiOutlinePlusCircle },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await getStatsAPI();
      return response.data.stats;
    },
  });

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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-[var(--color-surface)] rounded-lg" />
            <div className="h-4 w-64 bg-[var(--color-surface)] rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-[var(--color-surface)] rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
          ))}
        </div>
        <div className="h-52 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
      </div>
    );
  }

  const hasReviews = reviews.length > 0;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HiOutlineSparkles className="w-5 h-5" style={{ color: 'var(--color-accent-hover)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Welcome back,
            </span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-accent-hover)' }}>
              {firstName}!
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Dashboard</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Here&apos;s an overview of your code reviews and performance.
          </p>
        </div>
        <Link
          to="/review/new"
          className="btn-primary flex-shrink-0"
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
            <div className="lg:col-span-2">
              <RecentReviews reviews={reviews} />
            </div>
            <div className="lg:col-span-1">
              <ScoreTrendLine trend={stats.scoreTrend} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SeverityDonut breakdown={stats.severityBreakdown} />
            <LanguageBarChart breakdown={stats.languageBreakdown} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border p-10 text-center glass" style={{ borderColor: 'var(--color-border)' }}>
          <div
            className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl mb-5 animate-float"
            style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow-lg)' }}
          >
            <HiOutlineCodeBracket className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">No reviews yet</h2>
          <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
            Start your first code review by pasting a snippet or uploading a file. AI analysis completes in seconds.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all duration-200 cursor-pointer"
                  style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-glow)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Core Capabilities */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-bold text-white">Core Capabilities</h2>
          <span className="badge badge-accent">4 Features</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="feature-card group p-5 rounded-2xl border cursor-default"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 mb-4 transition-all duration-300"
                  style={{
                    background: feature.colorMuted,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Row */}
      <div
        className="rounded-2xl border p-5 glass"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h2 className="text-sm font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.backgroundColor = 'var(--color-accent-muted)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                  style={{ background: 'var(--color-accent-muted)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--color-accent-hover)' }} />
                </div>
                <span className="text-sm font-semibold text-white">{action.label}</span>
                <HiOutlineArrowRight
                  className="w-4 h-4 ml-auto transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
