'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ====== 类型定义 ======

/**
 * 会话记录（用于存储所有历史会话列表）
 */
export interface ChatSessionRecord {
  id: string
  title: string
  /** 最后一条消息的预览 */
  lastMessage?: string
  /** 消息数量 */
  messageCount: number
  createdAt: number
  updatedAt: number
  /** 是否置顶 */
  pinned?: boolean
}

export type ChatSessionStatus = 'idle' | 'loading' | 'error'

// ====== State 定义 ======

interface ChatState {
  /** 当前会话 ID */
  currentSessionId: string | null
  /** 当前会话标题 */
  currentSessionTitle: string | null
  /** 会话加载状态 */
  status: ChatSessionStatus
  /** 错误信息 */
  error: string | null

  /** 所有会话记录列表 */
  allSessions: ChatSessionRecord[]

  // === actions ===
  /** 创建新会话 */
  startNewSession: (title?: string) => string
  /** 切换到指定会话 */
  switchToSession: (sessionId: string) => void
  /** 删除会话 */
  deleteSession: (sessionId: string) => void
  /** 重命名会话 */
  renameSession: (sessionId: string, title: string) => void
  /** 置顶/取消置顶会话 */
  togglePinSession: (sessionId: string) => void
  /** 更新会话元数据（消息数、最后消息等） */
  updateSessionMetadata: (sessionId: string, metadata: Partial<ChatSessionRecord>) => void

  /** 从后端加载所有会话列表 */
  loadAllSessions: (sessions: ChatSessionRecord[]) => void
  /** 设置状态 */
  setStatus: (status: ChatSessionStatus) => void
  /** 设置错误 */
  setError: (error: string | null) => void
  /** 清空所有数据 */
  clearAll: () => void
}

// ====== 辅助函数 ======

const now = () => Date.now()

const createId = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const createDefaultTitle = () => {
  const id = createId()
  return `New Chat ${id.slice(0, 8)}`
}

// ====== Store 实现 ======

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentSessionId: null,
      currentSessionTitle: null,
      status: 'idle',
      error: null,
      allSessions: [],

      startNewSession: (title?: string) => {
        const sessionId = createId()
        const sessionTitle = title || createDefaultTitle()
        const createdAt = now()

        const newSession: ChatSessionRecord = {
          id: sessionId,
          title: sessionTitle,
          messageCount: 0,
          createdAt,
          updatedAt: createdAt,
        }

        set((state) => ({
          currentSessionId: sessionId,
          currentSessionTitle: sessionTitle,
          status: 'idle',
          error: null,
          allSessions: [newSession, ...state.allSessions],
        }))

        return sessionId
      },

      switchToSession: (sessionId) => {
        const { allSessions } = get()
        const targetSession = allSessions.find((s) => s.id === sessionId)

        if (targetSession) {
          set({
            currentSessionId: targetSession.id,
            currentSessionTitle: targetSession.title,
            status: 'idle',
            error: null,
          })
        }
      },

      deleteSession: (sessionId) => {
        const { currentSessionId, allSessions } = get()

        const newSessions = allSessions.filter((s) => s.id !== sessionId)

        set({ allSessions: newSessions })

        // 如果删除的是当前会话，切换到第一个或创建新会话
        if (currentSessionId === sessionId) {
          if (newSessions.length > 0) {
            const nextSession = newSessions[0]
            set({
              currentSessionId: nextSession.id,
              currentSessionTitle: nextSession.title,
            })
          } else {
            get().startNewSession()
          }
        }
      },

      renameSession: (sessionId, title) => {
        const { currentSessionId } = get()

        set((state) => ({
          allSessions: state.allSessions.map((s) =>
            s.id === sessionId ? { ...s, title, updatedAt: now() } : s,
          ),
        }))

        if (currentSessionId === sessionId) {
          set({ currentSessionTitle: title })
        }
      },

      togglePinSession: (sessionId) => {
        set((state) => ({
          allSessions: state.allSessions.map((s) =>
            s.id === sessionId ? { ...s, pinned: !s.pinned, updatedAt: now() } : s,
          ),
        }))
      },

      updateSessionMetadata: (sessionId, metadata) => {
        const { currentSessionId } = get()

        set((state) => ({
          allSessions: state.allSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  ...metadata,
                  updatedAt: now(),
                }
              : s,
          ),
        }))

        // 如果更新的是当前会话且包含 title，同步更新
        if (currentSessionId === sessionId && metadata.title) {
          set({ currentSessionTitle: metadata.title })
        }
      },

      loadAllSessions: (sessions) => {
        set({ allSessions: sessions })
      },

      setStatus: (status) => set({ status }),

      setError: (error) => set({ error }),

      clearAll: () => {
        set({
          currentSessionId: null,
          currentSessionTitle: null,
          status: 'idle',
          error: null,
          allSessions: [],
        })
      },
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({
        allSessions: state.allSessions,
        currentSessionId: state.currentSessionId,
        currentSessionTitle: state.currentSessionTitle,
      }),
    },
  ),
)
