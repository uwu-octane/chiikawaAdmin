import type { MemoStore } from '../../schema/conversation/memo'
import type { ConversationMemo } from '../../schema/conversation/memo'
import type { MemoCache } from '../../schema/conversation/memo'
import type { MemoPersistence } from '../../schema/conversation/memo'

/**
 * MemoCacheAsideStore 实现 Cache-Aside 模式
 */
export function createMemoCacheAsideStore(
  cache: MemoCache,
  persistence: MemoPersistence,
): MemoStore {
  async function getMemo(sessionId: string): Promise<ConversationMemo | null> {
    // 先读缓存
    const cached = await cache.get(sessionId)
    if (cached) {
      return cached
    }

    // 缓存未命中，读数据库
    const persisted = await persistence.get(sessionId)
    if (persisted) {
      // 写入缓存
      await cache.set(sessionId, persisted)
    }

    return persisted
  }

  async function upsertMemo(memo: ConversationMemo): Promise<void> {
    // 写数据库
    await persistence.upsert(memo.sessionId, memo)
    // 更新缓存
    await cache.set(memo.sessionId, memo)
  }

  async function deleteMemo(sessionId: string): Promise<void> {
    // 删除数据库
    await persistence.delete(sessionId)
    // 删除缓存
    await cache.delete(sessionId)
  }

  return {
    getMemo,
    upsertMemo,
    deleteMemo,
  }
}
