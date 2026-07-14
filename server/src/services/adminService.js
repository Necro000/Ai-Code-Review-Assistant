const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

const getStats = async () => {
  const [totalUsers, totalReviews, totalProjects, avgScoreSummary] = await Promise.all([
    prisma.user.count(),
    prisma.review.count(),
    prisma.project.count(),
    prisma.review.aggregate({
      _avg: {
        overallScore: true
      }
    })
  ]);

  return {
    totalUsers,
    totalReviews,
    totalProjects,
    averageScore: avgScoreSummary._avg.overallScore 
      ? Math.round(avgScoreSummary._avg.overallScore * 10) / 10 
      : null
  };
};

const listUsers = async ({ page = 1, limit = 10 }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            projects: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.user.count()
  ]);

  return {
    users,
    meta: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

const updateUserRole = async (userId, role) => {
  if (role !== 'admin' && role !== 'user') {
    throw new AppError('Invalid role value. Allowed roles: "user", "admin"', 400, 'VALIDATION_ERROR');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });
};

const deleteUser = async (userId) => {
  await prisma.user.delete({
    where: { id: userId }
  });
  return { message: 'User deleted successfully' };
};

const listReviews = async ({ page = 1, limit = 10 }) => {
  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const take = parseInt(limit, 10);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        project: {
          select: {
            projectName: true,
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take
    }),
    prisma.review.count()
  ]);

  return {
    reviews,
    meta: {
      page: parseInt(page, 10),
      limit: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  };
};

module.exports = {
  getStats,
  listUsers,
  updateUserRole,
  deleteUser,
  listReviews
};
