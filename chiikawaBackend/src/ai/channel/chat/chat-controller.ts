import { ChatRequestBody } from './chat-mapper'
import { convertToModelMessages, type ModelMessage, type UIMessage } from 'ai'
import { llmClient } from '@/ai/llm/client'
import type { ConversationSession } from '@/store/schema/conversation/session'
import { getConversationRepository } from '@/store/repository/conversation/repo'
import type { ConversationMessage } from '@/store/schema/conversation/message'
import { baseLogger } from '@/logger/logger'
const conversationRepository = await getConversationRepository()
const { sessions: sessionStore, messages: messageStore } = conversationRepository
const log = baseLogger.getSubLogger({ name: 'chatController' })

function extractTextFromUIMessage(msg: UIMessage): { text: string; uiMessageId?: string } {
  const textParts = msg.parts?.filter((p) => p.type === 'text') ?? []
  const text = textParts.map((p) => p.text).join('\n')
  return { text, uiMessageId: msg.id }
}

export const chatController = {
  async handleChatRequest(body: ChatRequestBody): Promise<Response> {
    const sessionId = body.id
    const uiMessage: UIMessage = body.message
    log.debug({ uiMessageParts: uiMessage.parts }, 'received uiMessage')
    const now = new Date()

    //* upsert session
    let session: ConversationSession | null = await sessionStore.getById(sessionId)
    if (!session) {
      session = {
        sessionId: sessionId,
        channel: 'web-chat' as const,
        startedAt: now,
        lastMessageAt: now,
        createdAt: now,
        updatedAt: now,
      }
    } else {
      session = {
        ...session,
        lastMessageAt: now,
        updatedAt: now,
      }
    }
    await sessionStore.upsert(session)

    //* list history messages and sort
    const historyMessages: ConversationMessage[] = await messageStore.listBySessionId(sessionId)
    historyMessages.sort((a, b) => a.index - b.index)

    const historyUiMessages: UIMessage[] = historyMessages.map((m) => m.message)
    const { text: userText } = extractTextFromUIMessage(uiMessage)
    if (!userText || !userText.trim()) {
      throw new Error('Empty user message content')
    }

    const nextIndex = historyMessages.length
    //* append user message
    const userConvMessage: ConversationMessage = {
      id: `msg_${sessionId}_${nextIndex}`,
      sessionId,
      index: nextIndex,
      message: uiMessage,
      createdAt: now,
      updatedAt: now,
    }
    await messageStore.append(userConvMessage)

    const historyModelMessages: ModelMessage[] = convertToModelMessages(historyUiMessages)
    const [userModelMessage] = convertToModelMessages([uiMessage])

    const modelMessages: ModelMessage[] = [...historyModelMessages, userModelMessage]
    log.info({ modelMessagesLength: modelMessages.length }, 'modelMessages')
    const stream = await llmClient.streamChatRaw({
      logicalModelId: 'fast-chat',
      messages: modelMessages,
      maxOutputTokens: 10000,
    })
    const assistantIndex = nextIndex + 1
    //stream.consumeStream()
    return stream.toUIMessageStreamResponse({
      onFinish: async ({ responseMessage, isAborted }) => {
        log.debug('onFinish')
        if (isAborted) {
          log.debug('isAborted')
          return
        }
        if (!responseMessage || responseMessage.role !== 'assistant') {
          log.error('responseMessage is not assistant')
          return
        }
        const { text: assistantText } = extractTextFromUIMessage(responseMessage)
        if (!assistantText.trim()) {
          log.error('assistantText is empty')
          return
        }
        const nowFinish = new Date()
        const assistantConvMessage: ConversationMessage = {
          id: `msg_${sessionId}_${assistantIndex}`,
          sessionId,
          index: assistantIndex,
          message: responseMessage,
          createdAt: nowFinish,
          updatedAt: nowFinish,
        }
        await messageStore.append(assistantConvMessage)
      },
      onError: (error: unknown): string => {
        log.error({ error }, 'streamText error')
        return error.toString()
      },
    })
  },
}
