import { z } from 'zod'

/**
 * ConversationMemo 的 Zod Schema
 */
export const ConversationMemoSchema = z.object({
  sessionId: z.string(),
  summary: z.string(),
  updatedAt: z.date(),
  structured: z.record(z.string(), z.unknown()).optional(),
})

/**
 * ConversationMemo 类型定义（从 Zod Schema 推断）
 */
export type ConversationMemo = z.infer<typeof ConversationMemoSchema>

/**
 * MemoCache 方法参数和返回值的 Zod Schema
 */
export const MemoCacheSchemas = {
  get: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.custom<ConversationMemo>().nullable()),
  },
  set: {
    args: z.object({
      sessionId: z.string(),
      memo: z.custom<ConversationMemo>(),
    }),
    returns: z.promise(z.void()),
  },
  delete: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.void()),
  },
} as const

/**
 * MemoCache 类型定义（Redis 缓存）
 */
export type MemoCache = {
  get(sessionId: string): Promise<ConversationMemo | null>
  set(sessionId: string, memo: ConversationMemo): Promise<void>
  delete(sessionId: string): Promise<void>
}

/**
 * MemoPersistence 方法参数和返回值的 Zod Schema
 */
export const MemoPersistenceSchemas = {
  get: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.custom<ConversationMemo>().nullable()),
  },
  upsert: {
    args: z.object({
      sessionId: z.string(),
      memo: z.custom<ConversationMemo>(),
    }),
    returns: z.promise(z.void()),
  },
  delete: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.void()),
  },
} as const

/**
 * MemoPersistence 类型定义（DB 持久化）
 */
export type MemoPersistence = {
  get(sessionId: string): Promise<ConversationMemo | null>
  upsert(sessionId: string, memo: ConversationMemo): Promise<void>
  delete(sessionId: string): Promise<void>
}

/**
 * MemoPersistDispatcher 方法参数和返回值的 Zod Schema
 */
export const MemoPersistDispatcherSchemas = {
  enqueueUpsert: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.void()),
  },
  enqueueDelete: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.void()),
  },
} as const

/**
 * 异步持久化调度器
 *
 * 约定：
 * - MemoStore 不直接调 MemoPersistence，而是把"要持久化的动作"丢给 dispatcher
 * - dispatcher 可以是：
 *   - 一条消息队列（Kafka / RabbitMQ / NATS / Redis Stream）
 */
export type MemoPersistDispatcher = {
  /**
   * 异步排队：把"某个 session 对应的 memo 需要 upsert"这个事实交给后台 worker
   */
  enqueueUpsert(sessionId: string): Promise<void>

  /**
   * 异步排队：把"某个 session 对应的 memo 需要从 DB 删除"这个事实交给后台 worker
   */
  enqueueDelete(sessionId: string): Promise<void>
}

/**
 * MemoStore 方法参数和返回值的 Zod Schema
 */
export const MemoStoreSchemas = {
  getMemo: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.custom<ConversationMemo>().nullable()),
  },
  upsertMemo: {
    args: z.object({
      memo: z.custom<ConversationMemo>(),
    }),
    returns: z.promise(z.void()),
  },
  deleteMemo: {
    args: z.object({
      sessionId: z.string(),
    }),
    returns: z.promise(z.void()),
  },
} as const

/**
 * MemoStore 对上层暴露的统一接口
 *
 * 约定：
 * - 所有的读 / 写操作，调用方都只认这个接口
 * - 内部如何协调 Redis + DB + 队列，由实现类负责
 */
export type MemoStore = {
  /**
   * 获取会话的 memo
   *
   * 读优先级：
   * 1. 先读 Redis（MemoCache）
   * 2. 如果未来需要兜底 DB，可以在实现里增加"cache miss 时 fallback 到 DB"的逻辑
   */
  getMemo(sessionId: string): Promise<ConversationMemo | null>

  /**
   * 写入 / 更新会话 memo
   *
   * 约定：
   * - 必须同步写入 Redis（MemoCache）
   * - 同时通过 MemoPersistDispatcher 异步触发 DB upsert
   */
  upsertMemo(memo: ConversationMemo): Promise<void>

  /**
   * 删除会话 memo
   *
   * 约定：
   * - 同步删除 Redis 中的数据
   * - 同时通过 MemoPersistDispatcher 异步触发 DB 删除
   */
  deleteMemo(sessionId: string): Promise<void>
}

/**
 * MemoStoreDependencies 的 Zod Schema
 */
export const MemoStoreDependenciesSchema = z.object({
  cache: z.custom<MemoCache>(),
  persistence: z.custom<MemoPersistence>(),
  dispatcher: z.custom<MemoPersistDispatcher>(),
})

/**
 * MemoStoreDependencies 类型定义
 */
export type MemoStoreDependencies = z.infer<typeof MemoStoreDependenciesSchema>

/**
 * 未来可以实现的组合 MemoStore 样板接口（只给一个签名，不写实现）
 *
 * 注意：这里先不写具体逻辑，只是把构造函数和成员依赖固定下来，
 * 方便后面在一个地方实现 Redis + 异步 DB 持久化。
 */
export type RedisBackedMemoStore = MemoStore & {
  /** 依赖：缓存 + 持久化 + 异步 dispatcher */
  readonly deps: MemoStoreDependencies
}
