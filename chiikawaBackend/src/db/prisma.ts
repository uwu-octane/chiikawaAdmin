import { PrismaClient } from '../db/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import config from '@/config/config'
import { env } from 'bun'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const connectionString = env.DATABASE_URL
console.log('connectionString', connectionString)
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}
const adapter = new PrismaPg({ connectionString })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: config.app.mode === 'DEV' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  })

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}
// 应用关闭时断开 Prisma 连接
if (typeof process !== 'undefined') {
  const disconnect = async () => {
    await prisma.$disconnect()
  }

  process.on('SIGINT', disconnect)
  process.on('SIGTERM', disconnect)
  process.on('beforeExit', disconnect)
}
