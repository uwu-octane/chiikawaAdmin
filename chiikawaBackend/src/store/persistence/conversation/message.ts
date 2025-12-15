import { eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { conversationMessages } from '@/db/schema'
import type { ConversationMessage, PersistentMessageStore } from '../../schema/conversation/message'

/**
 * Drizzle 实现的消息持久化存储
 * 直接使用 Drizzle 类型，无需转换
 */
export const drizzleMessageStore: PersistentMessageStore = {
  async append(message: ConversationMessage): Promise<void> {
    await db.insert(conversationMessages).values(message)
  },

  async listBySessionId(sessionId: string): Promise<ConversationMessage[]> {
    return await db
      .select()
      .from(conversationMessages)
      .where(eq(conversationMessages.sessionId, sessionId))
      .orderBy(asc(conversationMessages.msgIndex))
  },
}

// 导出别名以保持向后兼容
export const messageStore = drizzleMessageStore
