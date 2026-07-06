const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const analysisController = require('../controllers/analysisController');
const verifyToken = require('../middleware/auth');
const AppError = require('../utils/AppError');

// Ensure tmp/uploads directory exists
const uploadDir = path.join(__dirname, '../../tmp/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage & limits config
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 500 * 1024, // 500 KB limit per file
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.py',
      '.java',
      '.cpp',
      '.c',
      '.go',
      '.rb',
      '.txt', // Added text for test convenience
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          `File type "${ext}" not supported. Allowed formats: ${allowedExtensions.join(', ')}`,
          400,
          'INVALID_FILE_TYPE'
        )
      );
    }
  },
});

const router = express.Router();

// Secured endpoints
router.use(verifyToken);

router.post('/snippet', analysisController.submitSnippet);

// Max 5 files can be uploaded concurrently
router.post('/upload', upload.array('files', 5), analysisController.uploadFiles);

module.exports = router;
