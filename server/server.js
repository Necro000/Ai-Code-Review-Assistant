const app = require('./src/app');
const { PORT, NODE_ENV } = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/db');

/**
 * Start the server.
 */
async function startServer() {
  // Connect to database
  await connectDB();

  // Start listening
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${NODE_ENV}`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n⚡ ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('👋 Server closed');
      process.exit(0);
    });

    // Force close after 10s if graceful shutdown fails
    setTimeout(() => {
      console.error('⏰ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled rejections and exceptions
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    shutdown('UNHANDLED_REJECTION');
  });

  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

startServer();
