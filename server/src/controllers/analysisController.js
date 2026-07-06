const codeService = require('../services/codeService');
const { prisma } = require('../config/db');
const { runCodeAnalysis } = require('../services/analysisOrchestrator');
const { sendSuccess } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');

/**
 * Submit Code Snippet Controller
 */
const submitSnippet = async (req, res, next) => {
  try {
    const { code, language, projectId } = req.body;

    if (!projectId) {
      throw new AppError('Project ID is required', 400, 'PROJECT_ID_REQUIRED');
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    const processed = await codeService.processSnippet(code, language, projectId);
    
    // Invoke pipeline orchestrator
    const { review, complexity } = await runCodeAnalysis(
      processed.code,
      processed.language,
      projectId,
      processed.fileName
    );

    return sendSuccess(res, {
      data: { review, complexity },
      message: 'Code analysis completed successfully',
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload Source Files Controller
 */
const uploadFiles = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      throw new AppError('Project ID is required', 400, 'PROJECT_ID_REQUIRED');
    }

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.userId },
    });

    if (!project) {
      throw new AppError('Project not found', 404, 'PROJECT_NOT_FOUND');
    }

    const processedFiles = await codeService.processUploads(req.files, projectId);
    const results = [];

    // Process reviews sequentially through orchestrator pipeline
    for (const file of processedFiles) {
      const { review, complexity } = await runCodeAnalysis(
        file.code,
        file.language,
        projectId,
        file.fileName
      );
      results.push({ review, complexity });
    }

    return sendSuccess(res, {
      data: { reviews: results },
      message: `${processedFiles.length} file(s) processed and analyzed successfully`,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitSnippet,
  uploadFiles,
};
