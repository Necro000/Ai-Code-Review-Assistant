const { prisma } = require('../config/db');
const AppError = require('../utils/AppError');
const { sendWorkspaceInvitationEmail } = require('./emailService');

const assertOwner = async (workspaceId, userId) => {
  const ws = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId }
  });
  if (!ws) {
    throw new AppError('Forbidden: You are not the owner of this workspace', 403, 'FORBIDDEN');
  }
  return ws;
};

const assertMember = async (workspaceId, userId) => {
  const member = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId }
  });
  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId }
  });
  if (!member && ws?.ownerId !== userId) {
    throw new AppError('Forbidden: You are not a member of this workspace', 403, 'FORBIDDEN');
  }
};

const createWorkspace = async (name, ownerId) => {
  if (!name || name.trim() === '') {
    throw new AppError('Workspace name is required', 400, 'VALIDATION_ERROR');
  }

  return await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name: name.trim(),
        ownerId,
      }
    });

    // Automatically add owner as a member
    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId: ownerId,
        role: 'owner'
      }
    });

    return ws;
  });
};

const listWorkspaces = async (userId) => {
  return await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } }
      ]
    },
    include: {
      owner: {
        select: { id: true, name: true, email: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      projects: {
        select: { id: true, projectName: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const getWorkspaceById = async (workspaceId, userId) => {
  await assertMember(workspaceId, userId);

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: {
        select: { id: true, name: true, email: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      projects: {
        include: {
          reviews: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      }
    }
  });

  if (!ws) {
    throw new AppError('Workspace not found', 404, 'NOT_FOUND');
  }

  return ws;
};

const inviteMember = async (workspaceId, inviterUserId, inviteeEmail) => {
  const ws = await assertOwner(workspaceId, inviterUserId);

  const inviter = await prisma.user.findUnique({
    where: { id: inviterUserId },
    select: { name: true, email: true }
  });

  const normalizedEmail = inviteeEmail.toLowerCase().trim();
  const invitee = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (!invitee) {
    throw new AppError(`User with email "${inviteeEmail}" not found. They must register an account first.`, 404, 'USER_NOT_FOUND');
  }

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: invitee.id
      }
    }
  });

  if (existingMember) {
    throw new AppError('User is already a member of this workspace', 409, 'ALREADY_MEMBER');
  }

  const newMember = await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: invitee.id,
      role: 'member'
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  // Send invitation notification email in background
  sendWorkspaceInvitationEmail(invitee.email, ws.name, inviter?.name || inviter?.email).catch((err) => {
    console.error('Failed to send workspace invitation email:', err.message);
  });

  return newMember;
};

const removeMember = async (workspaceId, inviterUserId, userIdToRemove) => {
  const ws = await assertOwner(workspaceId, inviterUserId);

  if (ws.ownerId === userIdToRemove) {
    throw new AppError('Cannot remove the owner of the workspace', 400, 'INVALID_OPERATION');
  }

  return await prisma.workspaceMember.delete({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: userIdToRemove
      }
    }
  });
};

const deleteWorkspace = async (workspaceId, userId) => {
  await assertOwner(workspaceId, userId);

  await prisma.workspace.delete({
    where: { id: workspaceId }
  });

  return { message: 'Workspace deleted successfully' };
};

const addProjectToWorkspace = async (workspaceId, userId, projectId) => {
  await assertMember(workspaceId, userId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) {
    throw new AppError('Project not found or access denied', 404, 'PROJECT_NOT_FOUND');
  }

  return await prisma.project.update({
    where: { id: projectId },
    data: { workspaceId }
  });
};

const createWorkspaceProject = async (workspaceId, userId, projectName, githubUrl) => {
  await assertMember(workspaceId, userId);

  const nameStr = typeof projectName === 'string' ? projectName : (projectName?.projectName || '');

  if (!nameStr || nameStr.trim() === '') {
    throw new AppError('Project name is required', 400, 'VALIDATION_ERROR');
  }

  return await prisma.project.create({
    data: {
      userId,
      workspaceId,
      projectName: nameStr.trim(),
      githubUrl: typeof githubUrl === 'string' ? githubUrl.trim() : null
    }
  });
};

module.exports = {
  createWorkspace,
  listWorkspaces,
  getWorkspaceById,
  inviteMember,
  removeMember,
  deleteWorkspace,
  addProjectToWorkspace,
  createWorkspaceProject,
  assertMember
};
