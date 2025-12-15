import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { conversationSessions } from '@/db/schema'

/**
 * ConversationSession 类型 - 从 Drizzle schema 推断（读取）
 * 直接使用数据库类型，无需转换
 */
export type ConversationSession = InferSelectModel<typeof conversationSessions>

/**
 * ConversationSession 插入类型 - 从 Drizzle schema 推断（写入）
 */
export type ConversationSessionInsert = InferInsertModel<typeof conversationSessions>

/**
 * 会话来源渠道类型（从 Drizzle schema 约束推断）
 */
export type ConversationChannel = 'web-chat' | 'voice' | 'api'

/**
 * SessionStore 接口定义
 */
export interface SessionStore {
  getById(id: string): Promise<ConversationSession | null>
  upsert(session: ConversationSession): Promise<void>
}
