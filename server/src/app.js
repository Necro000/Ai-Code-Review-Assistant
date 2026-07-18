const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const { errorHandler } = require('./middleware/errorHandler');
const env = require('./config/env');
const { sendSuccess } = require('./utils/responseFormatter');

const app = express();

// Trust proxy settings for secure cookie and rate limits behind Nginx/Cloudflare load balancers
app.set('trust proxy', 1);

// ---------------------
// Global Middleware
// ---------------------

// Trim trailing slash from CLIENT_URL if present to prevent CORS mismatches
const corsOrigin = env.CLIENT_URL && env.CLIENT_URL.endsWith('/') ? env.CLIENT_URL.slice(0, -1) : env.CLIENT_URL;

// CORS — allow frontend origin with credentials (cookies)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, curl)
    if (!origin) {return callback(null, true);}

    const allowedOrigins = [
      corsOrigin,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ].filter(Boolean);

    const isAllowed = allowedOrigins.includes(origin) ||
                      origin.endsWith('.vercel.app') ||
                      /^http:\/\/localhost:\d+$/.test(origin) ||
                      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
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

// Express Session Store (PostgreSQL-backed via connect-pg-simple)
const sessionStore = env.DATABASE_URL
  ? new PgSession({
      conString: env.DATABASE_URL,
      createTableIfMissing: true,
    })
  : undefined;

// Express Session (required for Passport)
app.use(session({
  store: sessionStore,
  secret: env.SESSION_SECRET || 'fallback_session_secret_at_least_32_characters_long',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/api/auth', require('./routes/oauthRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/analysis', require('./routes/analysisRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/pr', require('./routes/prRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

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
