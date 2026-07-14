const { fetchPRFiles } = require('../services/githubPRService');
const { runCodeAnalysis } = require('../services/analysisOrchestrator');
const { sendSuccess } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const { prisma } = require('../config/db');

const reviewPR = async (req, res, next) => {
  try {
    const { owner, repo, pullNumber, projectId } = req.body;
    if (!owner || !repo || !pullNumber || !projectId) {
      throw new AppError('owner, repo, pullNumber, and projectId are required', 400, 'VALIDATION_ERROR');
    }

    // Validate project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId }
    });
    if (!project) {
      throw new AppError('Project not found or access denied', 404, 'PROJECT_NOT_FOUND');
    }

    const files = await fetchPRFiles(owner, repo, pullNumber);
    if (files.length === 0) {
      throw new AppError('No reviewable files found in this Pull Request', 400, 'NO_FILES_FOUND');
    }

    const results = [];
    for (const file of files) {
      const { review } = await runCodeAnalysis(file.code, file.language, projectId, file.fileName);
      results.push({
        reviewId: review.id,
        fileName: file.fileName,
        overallScore: review.overallScore,
        language: file.language,
      });
    }

    return sendSuccess(res, {
      data: { reviews: results, filesReviewed: files.length },
      message: `PR #${pullNumber} — ${files.length} file(s) reviewed successfully`,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { reviewPR };
