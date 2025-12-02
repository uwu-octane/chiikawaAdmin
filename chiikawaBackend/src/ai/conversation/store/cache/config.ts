/**
 * Redis key 前缀统一配置
 */
export const REDIS_KEY_PREFIX = {
  SESSION: 'chiikawa:conv:session:',
  MESSAGE: 'chiikawa:conv:msgs:',
  MEMO: 'chiikawa:conv:memo:',
} as const

/**
 * Redis TTL 配置（秒）
 */
export const REDIS_TTL = {
  /** 会话 TTL：7 天 */
  SESSION: 60 * 60 * 24 * 7,
  /** 消息 TTL：7 天 */
  MESSAGE: 60 * 60 * 24 * 7,
  /** Memo TTL：7 天 */
  MEMO: 60 * 60 * 24 * 7,
} as const
