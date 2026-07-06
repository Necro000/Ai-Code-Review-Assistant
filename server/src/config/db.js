const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Connect to the database and verify the connection.
 */
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Gracefully disconnect on shutdown.
 */
async function disconnectDB() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

module.exports = { prisma, connectDB, disconnectDB };
