import { useChatStore } from '../stores/chat'

/**
 * useChat hook - 封装 chat store 的便捷方法
 * 注意：此 hook 只管理会话元数据，消息由 Vercel AI SDK 的 useChat 管理
 */
export const useChatSession = () => {
  const {
    currentSessionId,
    currentSessionTitle,
    status,
    error,
    allSessions,
    startNewSession,
    switchToSession,
    deleteSession,
    renameSession,
    togglePinSession,
    updateSessionMetadata,
    loadAllSessions,
    setStatus,
    setError,
    clearAll,
  } = useChatStore()

  // 便捷状态判断
  const isLoading = status === 'loading'
  const hasError = !!error

  // 按置顶和更新时间排序的会话列表
  const sortedSessions = [...allSessions].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1
    }
    return b.updatedAt - a.updatedAt
  })

  return {
    // === 当前会话状态 ===
    currentSessionId,
    currentSessionTitle,
    status,
    error,

    // === 会话列表 ===
    sessions: sortedSessions,

    // 便捷状态
    isLoading,
    hasError,

    // === 会话操作 ===
    startNewSession,
    switchToSession,
    deleteSession,
    renameSession,
    togglePinSession,
    updateSessionMetadata,

    // === 其他 ===
    loadAllSessions,
    setStatus,
    setError,
    clearAll,
  }
}
