import type { RedisClientType } from 'redis'
import type { ConversationSession, SessionStore } from '../schema/session'
import { REDIS_KEY_PREFIX, REDIS_TTL } from './config'
import type { RedisStoreOptions } from './utils'
import { buildKey, setTTL } from './utils'
import { serializeSession, deserializeSession } from './protobuf'

/**
 * 用 Redis 存会话元数据的实现（使用 protobuf 序列化）
 */
export function createSessionStore(
  redis: RedisClientType,
  options?: Partial<RedisStoreOptions>,
): SessionStore {
  const keyPrefix = options?.keyPrefix ?? REDIS_KEY_PREFIX.SESSION
  const ttlSeconds = options?.ttlSeconds ?? REDIS_TTL.SESSION

  return {
    async getById(id: string): Promise<ConversationSession | null> {
      const key = buildKey(keyPrefix, id)
      const raw = await redis.get(key)
      if (!raw) return null
      const buffer = Buffer.from(raw as string, 'base64')
      // const buffer: Buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as string, 'binary')
      return deserializeSession(buffer)
    },

    async upsert(session: ConversationSession): Promise<void> {
      const key = buildKey(keyPrefix, session.sessionId)
      const buffer = serializeSession(session)
      // Redis 的 set 可以接受 Buffer
      const base64 = buffer.toString('base64')
      await redis.set(key, base64)
      await setTTL(redis, key, ttlSeconds)
    },
  }
}
