import type { RedisClientType } from 'redis'

/**
 * Redis Store 配置选项
 */
export interface RedisStoreOptions {
  /** Redis key 前缀 */
  keyPrefix: string
  /** TTL（秒），不设置则不过期 */
  ttlSeconds?: number
}

/**
 * 构建 Redis key
 */
export function buildKey(keyPrefix: string, id: string): string {
  return `${keyPrefix}${id}`
}

/**
 * 序列化对象为 JSON 字符串
 */
export function serialize<T>(data: T): string {
  return JSON.stringify(data)
}

/**
 * 反序列化时转换 Date 字段的通用方法
 */
export function convertDateFields<R extends Record<string, any>>(
  obj: R,
  dateFields: (keyof R)[],
): R {
  const result = { ...obj }
  for (const field of dateFields) {
    if (obj[field]) {
      result[field] = new Date(obj[field]) as any
    }
  }
  return result
}

/**
 * 设置 key 的 TTL（如果配置了的话）
 */
export async function setTTL(
  redis: RedisClientType,
  key: string,
  ttlSeconds?: number,
): Promise<void> {
  if (ttlSeconds && ttlSeconds > 0) {
    await redis.expire(key, ttlSeconds)
  }
}

