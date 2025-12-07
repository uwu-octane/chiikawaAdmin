import { PrismaClient } from '../db/generated/prisma/client'
import config from '@/config/config'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.app.mode === 'DEV' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
  } as never)

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
