const { prisma } = require('../config/db');

/**
 * Returns top users ranked by average review score.
 * Minimum 3 reviews required for statistical meaningfulness.
 */
const getLeaderboard = async (limit = 10) => {
  const rows = await prisma.$queryRaw`
    SELECT
      u.id,
      u.name,
      u.avatar_url                                AS "avatarUrl",
      COUNT(r.id)::int                            AS "reviewCount",
      ROUND(AVG(r.overall_score)::numeric, 1)     AS "averageScore",
      ROUND((MAX(r.overall_score) - MIN(r.overall_score))::numeric, 1) AS "improvement"
    FROM users u
    JOIN projects p ON p.user_id = u.id
    JOIN reviews  r ON r.project_id = p.id
    WHERE r.overall_score IS NOT NULL
    GROUP BY u.id, u.name, u.avatar_url
    HAVING COUNT(r.id) >= 3
    ORDER BY AVG(r.overall_score) DESC
    LIMIT ${limit}
  `;

  return rows.map((row, index) => ({ rank: index + 1, ...row }));
};

module.exports = { getLeaderboard };
