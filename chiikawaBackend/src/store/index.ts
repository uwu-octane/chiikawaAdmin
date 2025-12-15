import type { SessionStore } from './schema/conversation/session'
import type { MessageStore } from './schema/conversation/message'
import type { MemoStore } from './schema/conversation/memo'
import { createSessionStore } from './cache/conversation/session'
import { createMessageStore } from './cache/conversation/message'
import { getRedisClient } from '@/redis/redis'
import { createSessionCacheAsideStore } from './store/conversation/session-store'
import { createMessageCacheAsideStore } from './store/conversation/message-store'
import { drizzleMessageStore } from './persistence/conversation/message'
import { drizzleSessionStore } from './persistence/conversation/session'

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
 * 会话存储接口
 * 统一的业务层访问接口
 */
export interface ConversationStore {
  sessions: SessionStore
  messages: MessageStore
  memos: MemoStore
}

/**
 * 获取会话存储实例
 * 使用 Cache-Aside 模式（Redis 缓存 + Drizzle 持久化）
 */
export async function getConversationStore(): Promise<ConversationStore> {
  const redis = await getRedisClient()

  const sessionCache = createSessionStore(redis)
  const messageCache = createMessageStore(redis)
  const sessionPersistence = drizzleSessionStore
  const messagePersistence = drizzleMessageStore

  const sessions = createSessionCacheAsideStore(sessionCache, sessionPersistence)
  const messages = createMessageCacheAsideStore(messageCache, messagePersistence)
  const memos = new NoopMemoStore() // 先占位，之后换成 RedisBackedMemoStore

  return { sessions, messages, memos }
}

// 导出类型
export type { SessionStore } from './schema/conversation/session'
export type { MessageStore } from './schema/conversation/message'
export type { MemoStore } from './schema/conversation/memo'
export type { ConversationSession, ConversationSessionInsert } from './schema/conversation/session'
export type { ConversationMessage, ConversationMessageInsert } from './schema/conversation/message'
