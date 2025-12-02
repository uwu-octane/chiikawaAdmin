import { useChat as useAIChat } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'
import { useChatManager, type ChatMessage } from '@/contexts/chatContext'
import { useChatStore } from '../stores/chat'

/**
 * useChatSession - Chat Session Instance
 */
export const useChatSession = () => {
  // ==========  Zustand Store - Session Metadata ==========
  const {
    currentSessionId,
    currentSessionTitle,
    // sessionStatus: 'idle' | 'loading' | 'error'
    status: sessionStatus,
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

  // ========== ChatManager - Chat Instance + Message Persistence ==========
  const { getChat, loadChatMessages, saveChatMessages } = useChatManager()

  // ========== Get sessionId (for hooks call) ==========
  // use temporary ID to ensure hooks call order consistency
  const sessionId = currentSessionId || 'temp'

  // ========== Get current session's Chat Instance ==========
  const chat = getChat(sessionId)

  // ========== Vercel AI SDK - Message Streaming ==========
  const { messages, setMessages, sendMessage, status, stop, regenerate, ...restChatHook } =
    useAIChat<ChatMessage>({
      chat,
    })

  // ========== Auto restore history messages (on page load) ==========
  const isRestoredRef = useRef(false)
  const isRestoringRef = useRef(false) // mark if restoring, avoid saving during restoration

  // ========== Ensure current session==========
  useEffect(() => {
    if (!currentSessionId) {
      startNewSession()
    }
  }, [currentSessionId, startNewSession])

  //  on switch to new session, allow to restore
  useEffect(() => {
    if (currentSessionId) {
      isRestoredRef.current = false
      isRestoringRef.current = false
    }
  }, [currentSessionId])

  // ========== Auto restore history messages ==========
  useEffect(() => {
    // if no real session, do not restore
    if (!currentSessionId) return

    // only restore when first load and messages are empty
    if (!isRestoredRef.current && messages.length === 0) {
      const storedMessages = loadChatMessages(currentSessionId)
      if (storedMessages && storedMessages.length > 0) {
        console.log(
          `[useChatSession] Restoring ${storedMessages.length} messages for session ${currentSessionId}`,
        )
        isRestoringRef.current = true // mark if restoring
        setMessages(storedMessages)
      }
      isRestoredRef.current = true
    }
  }, [currentSessionId, loadChatMessages, setMessages, messages.length])

  // ========== Auto save messages to localStorage ==========
  useEffect(() => {
    // if no real session, do not save
    if (!currentSessionId) return

    // skip saving during restoration
    if (isRestoringRef.current) {
      isRestoringRef.current = false // reset mark
      return
    }

    // only save messages with actual content
    if (messages.length === 0) return

    if (status !== 'ready' && status !== 'error') return

    // call saveChatMessages, deduplication logic has been moved to ChatManager layer
    saveChatMessages(currentSessionId, messages)
  }, [messages, currentSessionId, saveChatMessages, status])

  // ========== Sync metadata to Zustand Store ==========
  useEffect(() => {
    // if no real session, do not sync
    if (!currentSessionId) return

    // only update when stream ends (status is 'ready' or 'error')
    if (status !== 'ready' && status !== 'error') return

    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      let lastMessageText = ''

      // extract text content of last message
      if (lastMessage?.parts) {
        lastMessageText = lastMessage.parts
          .filter((p) => p.type === 'text')
          .map((p) => (p as { type: 'text'; text: string }).text)
          .join('')
      }

      updateSessionMetadata(currentSessionId, {
        lastMessage: lastMessageText.slice(0, 100),
        messageCount: messages.length,
      })
    }
  }, [messages, currentSessionId, updateSessionMetadata, status])

  // ========== Return unified interface ==========
  return {
    // === Current session information ===
    sessionId,
    sessionTitle: currentSessionTitle,

    // === Messages (from Vercel AI SDK) ===
    messages,
    sendMessage,
    chatStatus: status, // type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';
    stop,
    regenerate,
    setMessages,
    ...restChatHook,

    // === Session operations (from Zustand Store) ===
    startNewSession,
    switchToSession,
    deleteSession,
    renameSession,
    togglePinSession,
    updateSessionMetadata,

    // === Session list (from Zustand Store) ===
    sessions: allSessions,

    // === Session status (from Zustand Store) ===
    sessionStatus, // session loading status: idle/loading/error
    error,

    // === Other operations ===
    loadAllSessions,
    setStatus,
    setError,
    clearAll,
  }
}
