import type { SessionStore } from '../schema/session'
import { createSessionStore } from '../cache/session'
import type { MessageStore } from '../schema/message'
import { createMessageStore } from '../cache/message'
import type { MemoStore } from '../schema/memo'
import { getRedisClient } from '@/redis/redis'

/**
 * 会话域统一仓库：
 * - sessions: 会话元数据
 * - messages: 原始消息
 * - memos:    会话摘要记忆
 */
export type ConversationRepository = {
  sessions: SessionStore
  messages: MessageStore
  memos: MemoStore
}

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

  const sessions = createSessionStore(redis)
  const messages = createMessageStore(redis)
  const memos = new NoopMemoStore() // 先占位，之后换成 RedisBackedMemoStore

  return { sessions, messages, memos }
}
