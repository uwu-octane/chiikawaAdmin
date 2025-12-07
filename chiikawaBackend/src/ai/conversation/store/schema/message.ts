import { z } from 'zod'
import type { UIMessage } from 'ai'

export const ConversationMessageSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  index: z.number().int().nonnegative(),
  message: z.custom<UIMessage>(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>
/**
 * MessageStore 方法参数和返回值的 Zod Schema
 */
export const MessageStoreSchemas = {
  append: {
    args: z.object({
      message: ConversationMessageSchema,
    }),
    returns: z.promise(z.void()),
  },
  listBySessionId: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.array(ConversationMessageSchema)),
  },
} as const

/**
 * MessageStore 类型定义
 */
export type MessageStore = {
  /**
   * 追加一条消息
   */
  append(message: ConversationMessage): Promise<void>

  /**
   * 按会话列出所有消息（开发阶段用，后面可以加分页）
   */
  listBySessionId(sessionId: string): Promise<ConversationMessage[]>
}
