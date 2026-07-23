const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');

/**
 * Create a new project
 */
const createProject = async (userId, projectName, githubUrl, workspaceId = null) => {
  const nameStr = typeof projectName === 'string' ? projectName : (projectName?.projectName || '');

  if (!nameStr || nameStr.trim().length === 0) {
    throw new AppError('Project name is required', 400, 'PROJECT_NAME_REQUIRED');
  }

  return await prisma.project.create({
    data: {
      userId,
      projectName: nameStr.trim(),
      githubUrl: typeof githubUrl === 'string' ? githubUrl.trim() : null,
      workspaceId: workspaceId || null,
    },
  });
};

const getAccessibleProjectWhereClause = (userId) => ({
  OR: [
    { userId },
    {
      workspace: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ]
      }
    }
  ]
});

/**
 * List all projects for a user
 */
const listProjects = async (userId) => {
  return await prisma.project.findMany({
    where: getAccessibleProjectWhereClause(userId),
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get project details by ID
 */
const getProjectById = async (userId, projectId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...getAccessibleProjectWhereClause(userId),
    },
  });

  if (!project) {
    throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
  }

  return project;
};

/**
 * Update project details
 */
const updateProject = async (userId, projectId, data) => {
  const { projectName, githubUrl, workspaceId } = data;
  const updateData = {};

  if (projectName !== undefined) {
    const nameStr = typeof projectName === 'string' ? projectName : (projectName?.projectName || '');
    if (nameStr.trim().length === 0) {
      throw new AppError('Project name cannot be empty', 400, 'PROJECT_NAME_REQUIRED');
    }
    updateData.projectName = nameStr.trim();
  }

  if (githubUrl !== undefined) {
    updateData.githubUrl = githubUrl ? githubUrl.trim() : null;
  }

  if (workspaceId !== undefined) {
    updateData.workspaceId = workspaceId || null;
  }

  // Ensure project exists and belongs to user
  await getProjectById(userId, projectId);

  return await prisma.project.update({
    where: { id: projectId },
    data: updateData,
  });
};

/**
 * Delete project and cascade delete reviews
 */
const deleteProject = async (userId, projectId) => {
  // Ensure project exists and belongs to user
  await getProjectById(userId, projectId);

  await prisma.project.delete({
    where: { id: projectId },
  });

  return { message: 'Project deleted successfully' };
};

module.exports = {
  createProject,
  listProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
