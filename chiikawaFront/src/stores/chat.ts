'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ====== Type definitions ======

/**
 * Chat session record (for storing all history session list)
 */
export interface ChatSessionRecord {
  id: string
  title: string
  /** preview of last message */
  lastMessage?: string
  /** message count */
  messageCount: number
  createdAt: number
  updatedAt: number
  /** whether pinned */
  pinned?: boolean
}

export type ChatSessionStatus = 'idle' | 'loading' | 'error'

// ====== State definitions ======

interface ChatState {
  /** current session ID */
  currentSessionId: string | null
  /** current session title */
  currentSessionTitle: string | null
  /** session loading status */
  status: ChatSessionStatus
  /** error information */
  error: string | null

  /** all session record list */
  allSessions: ChatSessionRecord[]

  // === actions ===
  /** create new session */
  startNewSession: (title?: string) => string
  /** switch to specified session */
  switchToSession: (sessionId: string) => void
  /** delete session */
  deleteSession: (sessionId: string) => void
  /** rename session */
  renameSession: (sessionId: string, title: string) => void
  /** toggle pin/unpin session */
  togglePinSession: (sessionId: string) => void
  /** update session metadata (message count, last message, etc.) */
  updateSessionMetadata: (sessionId: string, metadata: Partial<ChatSessionRecord>) => void

  /** load all session list from backend */
  loadAllSessions: (sessions: ChatSessionRecord[]) => void
  /** set status */
  setStatus: (status: ChatSessionStatus) => void
  /** set error */
  setError: (error: string | null) => void
  /** clear all data */
  clearAll: () => void
}

// ====== Helper functions ======

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

// ====== Store implementation ======

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

        // if deleted is current session, switch to first or create new session
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

        // if updated is current session and contains title, sync update
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
