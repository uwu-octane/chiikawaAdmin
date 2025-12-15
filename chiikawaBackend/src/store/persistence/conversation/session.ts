import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { conversationSessions } from '@/db/schema'
import type { ConversationSession, SessionStore } from '../../schema/conversation/session'

/**
 * Drizzle 实现的会话持久化存储
 * 直接使用 Drizzle 类型，无需转换
 */
export const drizzleSessionStore: SessionStore = {
  async getById(id: string): Promise<ConversationSession | null> {
    const rows = await db
      .select()
      .from(conversationSessions)
      .where(eq(conversationSessions.sessionId, id))
      .limit(1)

    return rows[0] ?? null
  },

  async upsert(session: ConversationSession): Promise<void> {
    await db.insert(conversationSessions).values(session).onConflictDoUpdate({
      target: conversationSessions.sessionId,
      set: session,
    })
  },
}

// 导出别名以保持向后兼容
export const sessionStore = drizzleSessionStore
