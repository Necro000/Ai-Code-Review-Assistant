const codeService = require('../services/codeService');
const projectService = require('../services/projectService');
const { prisma } = require('../config/db');
const { runCodeAnalysis } = require('../services/analysisOrchestrator');
const { sendSuccess } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const emailService = require('../services/emailService');

/**
 * Submit Code Snippet Controller
 */
const submitSnippet = async (req, res, next) => {
  try {
    const { code, language, projectId } = req.body;

    if (!projectId) {
      throw new AppError('Project ID is required', 400, 'PROJECT_ID_REQUIRED');
    }

    // Verify project belongs to user or accessible workspace
    const project = await projectService.getProjectById(req.userId, projectId);

    const processed = await codeService.processSnippet(code, language, projectId);
    
    // Invoke pipeline orchestrator
    const { review, complexity } = await runCodeAnalysis(
      processed.code,
      processed.language,
      projectId,
      processed.fileName
    );

    sendSuccess(res, {
      data: { review, complexity },
      message: 'Code analysis completed successfully',
      statusCode: 201,
    });

    if (req.userEmail) {
      emailService.sendReviewCompleteEmail(req.userEmail, review).catch(console.error);
    }
    return;
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

    // Verify project belongs to user or accessible workspace
    const project = await projectService.getProjectById(req.userId, projectId);

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

    sendSuccess(res, {
      data: { reviews: results },
      message: `${processedFiles.length} file(s) processed and analyzed successfully`,
      statusCode: 201,
    });

    if (req.userEmail) {
      for (const resItem of results) {
        emailService.sendReviewCompleteEmail(req.userEmail, resItem.review).catch(console.error);
      }
    }
    return;
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitSnippet,
  uploadFiles,
};
