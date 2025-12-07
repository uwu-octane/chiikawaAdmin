'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { Chat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'

export type ChatMessage = UIMessage

type ChatMap = Record<string, Chat<ChatMessage>>

// 消息持久化存储的 key 前缀
const STORAGE_PREFIX = 'chat_messages_'

interface ChatManagerValue {
  /** 根据 sessionId 拿 Chat 实例（不存在就创建） */
  getChat: (sessionId: string) => Chat<ChatMessage>
  /** 删除某个会话对应的 Chat 实例 */
  removeChat: (sessionId: string) => void
  /** 保存会话消息到 localStorage */
  saveChatMessages: (sessionId: string, messages: ChatMessage[]) => void
  /** 从 localStorage 加载会话消息 */
  loadChatMessages: (sessionId: string) => ChatMessage[] | null
}

const ChatManagerContext = createContext<ChatManagerValue | undefined>(undefined)

/**
 * 创建一个新的 Chat 实例
 */
function createChat(sessionId: string) {
  return new Chat<ChatMessage>({
    id: sessionId,
    transport: new DefaultChatTransport({
      //api: 'http://localhost:8989/api/chat-round-vercel-stream',
      api: '/chiikawa/api/chat',
      prepareSendMessagesRequest(options) {
        const { id, messages } = options as { id?: string; messages: ChatMessage[] }
        const last = messages[messages.length - 1]
        return {
          body: {
            id: id ?? sessionId,
            message: last,
          },
        }
      },
    }),
  })
}

/**
 * ChatManagerProvider
 *
 * 职责：
 * 1. 管理多个 Chat 实例（Map<sessionId, Chat>）
 * 2. 提供消息持久化到 localStorage 的能力
 * 3. 后续可以扩展为从后端加载/保存
 */
export function ChatManagerProvider({ children }: { children: ReactNode }) {
  const [chatMap, setChatMap] = useState<ChatMap>({})
  // 存储每个会话最后一次保存的签名，用于去重
  const lastSavedSignatureRef = useRef<Record<string, string>>({})

  // 使用 useCallback 创建稳定的函数引用，避免不必要的重新渲染
  const getChat = useCallback(
    (sessionId: string) => {
      // 已有就直接返回
      if (chatMap[sessionId]) {
        return chatMap[sessionId]
      }

      // 没有就创建一个新的Chat实例
      const newChat = createChat(sessionId)
      setChatMap((prev) => ({
        ...prev,
        [sessionId]: newChat,
      }))

      return newChat
    },
    [chatMap],
  )

  const removeChat = useCallback((sessionId: string) => {
    setChatMap((prev) => {
      const next = { ...prev }
      delete next[sessionId]
      return next
    })
    // 同时删除 localStorage 中的消息和签名缓存
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${STORAGE_PREFIX}${sessionId}`)
    }
    delete lastSavedSignatureRef.current[sessionId]
  }, [])

  //saveChatMessages 和 loadChatMessages 不依赖任何状态，可以保持稳定
  const saveChatMessages = useCallback((sessionId: string, messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return

    try {
      // 计算消息签名，用于去重
      const signature = JSON.stringify(
        messages.map((m) => ({
          id: m.id,
          role: m.role,
          parts: m.parts,
        })),
      )

      const prev = lastSavedSignatureRef.current[sessionId]
      if (prev === signature) {
        // 内容没变化，不重复写 & 不打 log
        return
      }

      lastSavedSignatureRef.current[sessionId] = signature
      localStorage.setItem(`${STORAGE_PREFIX}${sessionId}`, JSON.stringify(messages))
      console.log(`[ChatManager] Saved ${messages.length} messages for session ${sessionId}`)
    } catch (error) {
      console.error('[ChatManager] Failed to save messages:', error)
    }
  }, [])

  const loadChatMessages = useCallback((sessionId: string) => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${sessionId}`)
      if (!stored) return null

      const messages = JSON.parse(stored) as ChatMessage[]
      console.log(`[ChatManager] Loaded ${messages.length} messages for session ${sessionId}`)
      return messages
    } catch (error) {
      console.error('[ChatManager] Failed to load messages:', error)
      return null
    }
  }, [])

  const value: ChatManagerValue = {
    getChat,
    removeChat,
    saveChatMessages,
    loadChatMessages,
  }

  return <ChatManagerContext.Provider value={value}>{children}</ChatManagerContext.Provider>
}
export function useChatManager() {
  const ctx = useContext(ChatManagerContext)
  if (!ctx) {
    throw new Error('useChatManager 必须在 <ChatManagerProvider> 内使用')
  }
  return ctx
}
