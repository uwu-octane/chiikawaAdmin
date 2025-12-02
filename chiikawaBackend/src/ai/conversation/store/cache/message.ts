import type { RedisClientType } from 'redis'
import type { ConversationMessage, MessageStore } from '../schema/message'
import { REDIS_KEY_PREFIX, REDIS_TTL } from './config'
import type { RedisStoreOptions } from './utils'
import { buildKey } from './utils'
import { serializeMessage, deserializeMessage } from './protobuf'

/**
 * 用 Redis List 按 session 存消息（使用 protobuf 序列化）
 * key: chiikawa:conv:msgs:{sessionId}
 * value: [ msgProtobuf0, msgProtobuf1, ... ]
 */
export function createMessageStore(
  redis: RedisClientType,
  options?: Partial<RedisStoreOptions>,
): MessageStore {
  const keyPrefix = options?.keyPrefix ?? REDIS_KEY_PREFIX.MESSAGE
  const ttlSeconds = options?.ttlSeconds ?? REDIS_TTL.MESSAGE

  return {
    async append(message: ConversationMessage): Promise<void> {
      const key = buildKey(keyPrefix, message.sessionId)
      const buffer = serializeMessage(message)
      const base64 = buffer.toString('base64')
      await redis.multi().rPush(key, base64).expire(key, ttlSeconds).exec()
    },

    async listBySessionId(sessionId: string): Promise<ConversationMessage[]> {
      const key = buildKey(keyPrefix, sessionId)
      const items = await redis.lRange(key, 0, -1)
      if (!items || items.length === 0) return []
      return items.map((raw) => {
        const buffer = Buffer.from(raw, 'base64')
        return deserializeMessage(buffer)
      })
    },
  }
}
