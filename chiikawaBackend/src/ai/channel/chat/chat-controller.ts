import { ChatRequestBody } from './chat-mapper'
import { convertToModelMessages, type ModelMessage, type UIMessage } from 'ai'
import { llmClient } from '@/ai/llm/client'
import type { ConversationSession } from '@/ai/conversation/store/schema/session'
import { getConversationRepository } from '@/ai/conversation/store/repo/repo'
import type { ConversationMessage } from '@/ai/conversation/store/schema/message'
import { baseLogger } from '@/logger/logger'
const conversationRepository = await getConversationRepository()
const { sessions: sessionStore, messages: messageStore } = conversationRepository
const log = baseLogger.getSubLogger({ name: 'chatController' })

function extractTextFromUIMessage(msg: UIMessage): { text: string; uiMessageId?: string } {
  const textParts = msg.parts?.filter((p) => p.type === 'text') ?? []
  const text = textParts.map((p) => p.text).join('\n')
  return { text, uiMessageId: msg.id }
}

function mapConversationMessagesToModelMessages(
  convMessages: ConversationMessage[],
): ModelMessage[] {
  return convMessages.map<ModelMessage>((m) => {
    // 根据 role 创建正确类型的 ModelMessage
    switch (m.role) {
      case 'system':
        return { role: 'system', content: m.content }
      case 'user':
        return { role: 'user', content: m.content }
      case 'assistant':
        return { role: 'assistant', content: m.content }
      case 'tool':
        return { role: 'assistant', content: m.content }
    }
    // fallback
    return { role: 'user', content: m.content }
  })
}
export const chatController = {
  async handleChatRequest(body: ChatRequestBody): Promise<Response> {
    const sessionId = body.id
    const uiMessage: UIMessage = body.message
    let session: ConversationSession | null = await sessionStore.getById(sessionId)
    const now = new Date()
    if (!session) {
      session = {
        sessionId: sessionId,
        channel: 'web-chat',
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

    const historyMessages: ConversationMessage[] = await messageStore.listBySessionId(sessionId)
    const historyModelMessages: ModelMessage[] =
      mapConversationMessagesToModelMessages(historyMessages)
    const { text: userText, uiMessageId } = extractTextFromUIMessage(uiMessage)
    if (!userText || !userText.trim()) {
      throw new Error('Empty user message content')
    }

    const nextIndex = historyMessages.length

    const userConvMessage: ConversationMessage = {
      id: `msg_${sessionId}_${nextIndex}`,
      sessionId: sessionId,
      role: 'user',
      content: userText,
      index: nextIndex,
      uiMessageId,
      createdAt: now,
      updatedAt: now,
    }
    await messageStore.append(userConvMessage)
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
        try {
          log.info('onFinish')
          if (isAborted) {
            log.info('isAborted')
            return
          }
          if (!responseMessage || responseMessage.role !== 'assistant') {
            log.info('responseMessage is not assistant')
            return
          }
          const { text: assistantText } = extractTextFromUIMessage(responseMessage)
          if (!assistantText.trim()) {
            log.info('assistantText is empty')
            return
          }
          const assistantConvMessage: ConversationMessage = {
            id: `msg_${sessionId}_${assistantIndex}`,
            sessionId,
            role: 'assistant',
            content: assistantText,
            index: assistantIndex,
            uiMessageId: responseMessage.id,
            createdAt: now,
            updatedAt: now,
          }
          await messageStore.append(assistantConvMessage)
        } catch (error) {
          log.error({ error }, 'error in onFinish')
          return
        }
      },
      onError: (error: unknown): string => {
        log.error({ error }, 'streamText error')
        return error.toString()
      },
    })
  },
}
