const { fetchPRFiles } = require('../services/githubPRService');
const { runCodeAnalysis } = require('../services/analysisOrchestrator');
const { sendSuccess } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const projectService = require('../services/projectService');

/**
 * Extracts owner, repo, and pullNumber from a full GitHub PR URL if provided.
 */
const parsePRUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== 'string') {return null;}
  const match = urlStr.trim().match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (match) {
    return {
      owner: match[1],
      repo: match[2],
      pullNumber: parseInt(match[3], 10),
    };
  }
  return null;
};

const reviewPR = async (req, res, next) => {
  try {
    let { owner, repo, pullNumber, prUrl, projectId } = req.body;

    if (prUrl) {
      const parsed = parsePRUrl(prUrl);
      if (parsed) {
        owner = parsed.owner;
        repo = parsed.repo;
        pullNumber = parsed.pullNumber;
      }
    }

    if (!owner || !repo || !pullNumber || !projectId) {
      throw new AppError('Valid GitHub PR URL (or Owner, Repo, and PR Number) and Target Project are required.', 400, 'VALIDATION_ERROR');
    }

    // Validate project access (personal or workspace)
    await projectService.getProjectById(req.userId, projectId);

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
      message: `PR #${pullNumber} (${owner}/${repo}) — ${files.length} file(s) reviewed successfully`,
      statusCode: 201,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { reviewPR };
