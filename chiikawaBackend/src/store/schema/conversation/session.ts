import { z } from 'zod'

/**
 * 会话来源渠道枚举的 Zod Schema
 */
export const ConversationChannelSchema = z.enum(['web-chat', 'voice', 'api'])

/**
 * 会话来源渠道类型
 */
export type ConversationChannel = z.infer<typeof ConversationChannelSchema>

/**
 * 会话状态枚举的 Zod Schema
 */
export const ConversationStatusSchema = z.enum(['active', 'ended', 'archived'])

/**
 * 会话状态类型
 */
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>

/**
 * ConversationSession 的 Zod Schema
 */
export const ConversationSessionSchema = z.object({
  /** 会话 ID */
  sessionId: z.string(),
  /** 用户 ID：从 request-context 里拿（认证已由 gRPC 完成） */
  userId: z.string().optional(),
  /** 租户 / 客户组织 ID */
  tenantId: z.string().optional(),
  /** 会话来源渠道 */
  channel: ConversationChannelSchema,
  /** 会话标题 */
  title: z.string().optional(),
  /** 该会话是否已软删除（前端不再展示，但数据保留） */
  deleted: z.boolean().optional(),
  /** 第一条消息时间（通常是用户首条 user 消息时间） */
  startedAt: z.date(),
  /** 最后一条消息时间（user 或 assistant） */
  lastMessageAt: z.date(),
  /** 创建时间（记录写入 DB 的时间） */
  createdAt: z.date().optional(),
  /** 更新时间（最后一次持久化变更的时间） */
  updatedAt: z.date().optional(),
  /** 方便扩展的元数据，比如客户标签 / 渠道具体信息等 */
  metadata: z.record(z.string(), z.unknown()).optional(),
})

/**
 * ConversationSession 类型定义（从 Zod Schema 推断）
 */
export type ConversationSession = z.infer<typeof ConversationSessionSchema>

/**
 * SessionStore 方法参数和返回值的 Zod Schema
 */
export const SessionStoreSchemas = {
  getById: {
    args: z.object({
      id: z.string(),
    }),
    returns: z.promise(ConversationSessionSchema.nullable()),
  },
  upsert: {
    args: z.object({
      session: ConversationSessionSchema,
    }),
    returns: z.promise(z.void()),
  },
} as const

/**
 * SessionStore 类型定义
 */
export type SessionStore = {
  getById(id: string): Promise<ConversationSession | null>
  upsert(session: ConversationSession): Promise<void>
}

