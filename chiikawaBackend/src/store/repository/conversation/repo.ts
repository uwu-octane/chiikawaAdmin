import type { ConversationRepository } from './index'
import type { MemoStore } from '../../schema/conversation/memo'
import { createSessionStore } from '../../cache/conversation/session'
import { createMessageStore } from '../../cache/conversation/message'
import { getRedisClient } from '@/redis/redis'
import { createSessionCacheAsideStore } from '../../store/conversation/session-store'
import { createMessageCacheAsideStore } from '../../store/conversation/message-store'
import { prismaMessageStore } from '../../persistence/conversation/message'
import { prismaSessionStore } from '../../persistence/conversation/session'

/**
 * Memo 占位实现（待实现）
 */
class NoopMemoStore implements MemoStore {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getMemo(sessionId: string) {
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
  async upsertMemo(memo: any) {
    // noop
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteMemo(sessionId: string) {
    // noop
  }
}

/**
 * 获取会话仓库实例
 * 使用默认配置（key 前缀和 TTL 在 config.ts 中统一管理）
 */
export async function getConversationRepository(): Promise<ConversationRepository> {
  const redis = await getRedisClient()

  const sessionCache = createSessionStore(redis)
  const messageCache = createMessageStore(redis)
  const sessionPersistence = prismaSessionStore
  const messagePersistence = prismaMessageStore

  const sessions = createSessionCacheAsideStore(sessionCache, sessionPersistence)
  const messages = createMessageCacheAsideStore(messageCache, messagePersistence)
  const memos = new NoopMemoStore() // 先占位，之后换成 RedisBackedMemoStore

  return { sessions, messages, memos }
}
