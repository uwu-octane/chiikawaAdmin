import type { SessionStore, ConversationSession } from '../../schema/conversation/session'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'SessionCacheAsideStore' })
/**
 * SessionCacheAsideStore 实现 Cache-Aside 模式
 */
export function createSessionCacheAsideStore(
  cache: SessionStore,
  persistence: SessionStore,
): SessionStore {
  async function getById(id: string): Promise<ConversationSession | null> {
    // 先读缓存
    const cached = await cache.getById(id)
    if (cached) {
      log.debug('getById cached', cached.sessionId)
      return cached
    }

    // 缓存未命中，读数据库
    const persisted = await persistence.getById(id)
    if (persisted) {
      // 写入缓存
      log.debug('getById persisted', persisted.sessionId)
      await cache.upsert(persisted)
    }

    return persisted
  }

  async function upsert(session: ConversationSession): Promise<void> {
    // 写数据库
    await persistence.upsert(session)
    log.debug('upsert persisted', session.sessionId)
    // 更新缓存
    await cache.upsert(session)
    log.debug('upsert cached', session.sessionId)
  }

  return {
    getById,
    upsert,
  }
}
