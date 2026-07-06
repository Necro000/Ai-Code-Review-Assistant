const fs = require('fs').promises;
const path = require('path');
const { detectLanguage } = require('../utils/languageDetector');
const AppError = require('../utils/AppError');

/**
 * Process a code snippet submission
 */
const processSnippet = async (code, language, projectId) => {
  if (!code || code.trim().length === 0) {
    throw new AppError('Code content is required', 400, 'CODE_REQUIRED');
  }

  // Detect language if 'auto' or not provided
  let detectedLang = language;
  if (!language || language === 'auto' || language === 'unknown') {
    detectedLang = detectLanguage(null, code);
  }

  return {
    code: code.trim(),
    language: detectedLang,
    fileName: 'snippet.txt',
    projectId,
  };
};

/**
 * Process uploaded files
 */
const processUploads = async (files, projectId) => {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new AppError('No files uploaded', 400, 'FILES_REQUIRED');
  }

  const processedFiles = [];

  for (const file of files) {
    try {
      // Read temp file content
      const content = await fs.readFile(file.path, 'utf8');

      if (!content || content.trim().length === 0) {
        throw new AppError(`File ${file.originalname} is empty`, 400, 'EMPTY_FILE');
      }

      const detectedLang = detectLanguage(file.originalname, content);

      processedFiles.push({
        code: content,
        language: detectedLang,
        fileName: file.originalname,
        projectId,
      });
    } catch (error) {
      // Propagate operational errors
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to read file ${file.originalname}`, 500, 'FILE_READ_ERROR');
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(file.path);
      } catch (unlinkError) {
        console.error(`❌ Failed to delete temp file ${file.path}:`, unlinkError.message);
      }
    }
  }

  return processedFiles;
};

module.exports = {
  processSnippet,
  processUploads,
};
