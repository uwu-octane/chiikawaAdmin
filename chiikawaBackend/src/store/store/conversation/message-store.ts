import type {
  MessageStore,
  ConversationMessage,
  PersistentMessageStore,
} from '../../schema/conversation/message'

/**
 * MessageCacheAsideStore 实现 Cache-Aside 模式
 */
export function createMessageCacheAsideStore(
  cache: MessageStore,
  persistence: PersistentMessageStore,
): MessageStore {
  async function append(message: ConversationMessage): Promise<void> {
    // 写数据库
    await persistence.append(message)
    // 更新缓存
    await cache.append(message)
  }

  async function listBySessionId(sessionId: string): Promise<ConversationMessage[]> {
    // 先读缓存
    const cached = await cache.listBySessionId(sessionId)
    if (cached && cached.length > 0) {
      return cached
    }

    // 缓存未命中，读数据库
    const persisted = await persistence.listBySessionId(sessionId)
    if (persisted && persisted.length > 0) {
      // 写入缓存
      for (const message of persisted) {
        await cache.append(message)
      }
    }

    return persisted
  }

  return {
    append,
    listBySessionId,
  }
}
