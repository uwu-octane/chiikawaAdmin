import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { conversationMessages } from '@/db/schema'

/**
 * ConversationMessage 类型 - 直接使用 Drizzle schema 推断，无需转换
 */
export type ConversationMessage = InferSelectModel<typeof conversationMessages>

/**
 * ConversationMessage 插入类型
 */
export type ConversationMessageInsert = InferInsertModel<typeof conversationMessages>

/**
 * MessageStore 接口定义
 */
export interface MessageStore {
  /**
   * 追加一条消息
   */
  append(message: ConversationMessage): Promise<void>

  /**
   * 按会话列出所有消息（开发阶段用，后面可以加分页）
   */
  listBySessionId(sessionId: string): Promise<ConversationMessage[]>
}

export type PersistentMessageStore = MessageStore

export type CacheMessageStore = MessageStore & {
  clearSession?(sessionId: string): Promise<void>
}
