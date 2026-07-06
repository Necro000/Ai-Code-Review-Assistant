const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * List all reviews for a user with pagination and basic sorting.
 */
const listReviews = async (userId, { page = 1, limit = 10, sort = 'createdAt', order = 'desc' }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: {
        project: {
          userId,
        },
      },
      include: {
        project: {
          select: {
            projectName: true,
          },
        },
        findings: {
          select: {
            id: true,
            severity: true,
          },
        },
      },
      orderBy: {
        [sort]: order,
      },
      skip,
      take,
    }),
    prisma.review.count({
      where: {
        project: {
          userId,
        },
      },
    }),
  ]);

  return {
    reviews,
    meta: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Get detailed review by ID (including findings) verifying ownership.
 */
const getReviewById = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      project: {
        userId,
      },
    },
    include: {
      project: {
        select: {
          projectName: true,
        },
      },
      findings: {
        orderBy: [
          { severity: 'asc' }, // error -> warning -> info based on string sort or custom map if desired
          { lineNumber: 'asc' },
        ],
      },
    },
  });

  if (!review) {
    throw new AppError('Review not found', 404, 'REVIEW_NOT_FOUND');
  }

  return review;
};

/**
 * Delete a review verifying ownership.
 */
const deleteReview = async (userId, reviewId) => {
  // Verify ownership
  await getReviewById(userId, reviewId);

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return { message: 'Review deleted successfully' };
};

/**
 * Query search reviews with filters (severity, reviewType, text matches)
 */
const searchReviews = async (userId, { q = '', severity = '', reviewType = '', page = 1, limit = 10 }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  // Set up filters
  const searchFilter = {
    project: {
      userId,
    },
  };

  if (reviewType) {
    searchFilter.reviewType = reviewType;
  }

  // Filter based on severity of findings
  if (severity) {
    searchFilter.findings = {
      some: {
        severity,
      },
    };
  }

  // Text search query matching summary or language
  if (q) {
    searchFilter.OR = [
      { summary: { contains: q, mode: 'insensitive' } },
      { language: { contains: q, mode: 'insensitive' } },
      { project: { projectName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: searchFilter,
      include: {
        project: {
          select: {
            projectName: true,
          },
        },
        findings: {
          select: {
            id: true,
            severity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    }),
    prisma.review.count({
      where: searchFilter,
    }),
  ]);

  return {
    reviews,
    meta: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  };
};

/**
 * Aggregate stats metrics for Dashboard view.
 */
const getDashboardStats = async (userId) => {
  // 1. Fetch total review counts and average score
  const reviewsSummary = await prisma.review.aggregate({
    where: {
      project: {
        userId,
      },
    },
    _count: {
      id: true,
    },
    _avg: {
      overallScore: true,
    },
  });

  const totalReviews = reviewsSummary._count.id;
  const averageScore = reviewsSummary._avg.overallScore 
    ? Math.round(reviewsSummary._avg.overallScore * 10) / 10 
    : null;

  // 2. Fetch all findings of this user's reviews for severity breakdown
  const findingsCount = await prisma.reviewFinding.groupBy({
    by: ['severity'],
    where: {
      review: {
        project: {
          userId,
        },
      },
    },
    _count: {
      id: true,
    },
  });

  const severityBreakdown = {
    error: 0,
    warning: 0,
    info: 0,
  };

  let totalIssues = 0;
  findingsCount.forEach((item) => {
    if (severityBreakdown[item.severity] !== undefined) {
      severityBreakdown[item.severity] = item._count.id;
      totalIssues += item._count.id;
    }
  });

  // Calculate clean passes: reviews with 0 error or warning findings
  const cleanPassesCount = await prisma.review.count({
    where: {
      project: {
        userId,
      },
      findings: {
        none: {
          severity: {
            in: ['error', 'warning'],
          },
        },
      },
    },
  });

  // 3. Fetch recent reviews for score trend chart (recent 10)
  const recentReviews = await prisma.review.findMany({
    where: {
      project: {
        userId,
      },
    },
    select: {
      id: true,
      overallScore: true,
      createdAt: true,
      language: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });

  // Reverse to make chronological for line charts
  const scoreTrend = recentReviews.reverse();

  return {
    totalReviews,
    averageScore,
    totalIssues,
    cleanPasses: cleanPassesCount,
    severityBreakdown,
    scoreTrend,
  };
};

module.exports = {
  listReviews,
  getReviewById,
  deleteReview,
  searchReviews,
  getDashboardStats,
};
