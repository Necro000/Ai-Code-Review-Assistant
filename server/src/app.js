const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorHandler');
const { CLIENT_URL } = require('./config/env');
const { sendSuccess } = require('./utils/responseFormatter');

const app = express();

// ---------------------
// Global Middleware
// ---------------------

// CORS — allow frontend origin with credentials (cookies)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies (1 MB limit)
app.use(express.json({ limit: '1mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies (for refresh tokens)
app.use(cookieParser());

// Disable X-Powered-By header (security)
app.disable('x-powered-by');

// ---------------------
// Routes
// ---------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  sendSuccess(res, {
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    message: 'Server is running',
  });
});

// Route mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// ---------------------
// Error Handling
// ---------------------

// 404 handler for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
