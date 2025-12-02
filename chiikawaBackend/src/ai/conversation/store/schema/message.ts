import { z } from 'zod'
import type { ModelMessage } from 'ai'

/**
 * 对话角色枚举的 Zod Schema
 */
export const ConversationMessageRoleSchema = z.enum(['system', 'user', 'assistant', 'tool'])

/**
 * 对话角色类型
 */
export type ConversationMessageRole = z.infer<typeof ConversationMessageRoleSchema>

/**
 * ConversationMessage 的 Zod Schema
 *
 * 注意：modelMessageSnapshot 和 metadata 使用 z.any() 因为它们是动态结构
 */
export const ConversationMessageSchema = z.object({
  /** 消息 ID（推荐 uuid/ulid，和前端 UIMessage.id 可以不同） */
  id: z.string().optional(),
  /** 所属会话 ID（即 ConversationSession.id / 前端 sessionId） */
  sessionId: z.string(),
  /** 角色 */
  role: ConversationMessageRoleSchema,
  /**
   * 规范化后的文本内容
   * - 对于 text 来说，就是纯文本（汇总自 UIMessage.parts）
   * - 对于 tool / 结构化内容，可以存成 JSON.stringify(...) 的字符串
   */
  content: z.string(),
  /**
   * 在本会话中的顺序索引：
   * - 从 0 或 1 开始递增
   * - 方便按 index 排序，也方便做"最近 N 条"查询
   */
  index: z.number().int().nonnegative(),
  /** 前端 UIMessage 的 id（如果这条是从前端来的） */
  uiMessageId: z.string().optional(),
  /**
   * 用于调用 LLM 的原始 ModelMessage（可选持久化）
   * - 如果你希望完整追溯"prompt 是什么"，可以存起来
   */
  modelMessageSnapshot: z.custom<ModelMessage>().optional(),
  /**
   * 任意扩展元数据
   * 比如：
   * - tool name
   * - 是否经过 RAG 增强
   * - token usage（如果你后面从 log 里回填）
   */
  metadata: z.record(z.string(), z.unknown()).optional(),
  /** 消息生成时间（用户发送 / 模型生成的时刻） */
  createdAt: z.date(),
  /** 更新时间（编辑历史 / 标注 / 后处理时会改） */
  updatedAt: z.date(),
})

/**
 * ConversationMessage 类型定义（从 Zod Schema 推断）
 */
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
