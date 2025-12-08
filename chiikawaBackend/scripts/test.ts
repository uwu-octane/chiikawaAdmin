// scripts/test-prisma.ts
import { prisma } from '@/db/prisma'

async function main() {
  console.log('[test-prisma] start')

  // 用 $queryRaw + 模板字符串，而不是 $queryRawUnsafe
  const rows = await prisma.$queryRaw<
    { current_user: string; current_database: string }[]
  >`select current_user, current_database()`

  console.log('[test-prisma] result:', rows)
}

main()
  .then(() => {
    console.log('[test-prisma] OK')
  })
  .catch((err) => {
    console.error('[test-prisma] ERROR:', err)
  })
  .finally(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
