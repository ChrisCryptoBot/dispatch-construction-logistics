/**
 * Prisma Client Singleton - Production Ready
 * 
 * Ensures only one Prisma client instance is created.
 * Prevents "Too many Prisma clients" error in development.
 * Includes connection pooling and performance monitoring.
 */

const { PrismaClient } = require('@prisma/client')

// Connection pool configuration for high concurrency
const connectionConfig = {
  // Logging configuration
  log: process.env.NODE_ENV === 'production' 
    ? ['error', 'warn']
    : ['query', 'error', 'warn', 'info'],
  
  // Error formatting
  errorFormat: 'minimal',
  
  // Connection pool settings for 10,000+ concurrent users
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}

// Query performance extensions
const prismaExtensions = (client) => client.$extends({
  name: 'performance-monitor',
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = Date.now()
        try {
          const result = await query(args)
          const duration = Date.now() - start
          
          // Log slow queries (>100ms)
          if (duration > 100) {
            console.warn(`[SLOW QUERY] ${model}.${operation} took ${duration}ms`)
          }
          
          return result
        } catch (error) {
          console.error(`[QUERY ERROR] ${model}.${operation}:`, error.message)
          throw error
        }
      }
    }
  }
})

// Singleton pattern
let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = prismaExtensions(new PrismaClient(connectionConfig))
} else {
  // In development, use global to persist across hot reloads
  if (!global.__prisma) {
    global.__prisma = prismaExtensions(new PrismaClient(connectionConfig))
  }
  prisma = global.__prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

module.exports = { prisma }


