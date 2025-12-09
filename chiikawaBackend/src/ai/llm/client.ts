import '@/ai/llm/provider'
import { streamText, type ModelMessage, generateText } from 'ai'
import { getModelConfig, type LogicalModelId } from './model'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'llmClient' })

/**
 * StreamChatParams 类型
 */
export type StreamChatParams = {
  logicalModelId: LogicalModelId
  messages: ModelMessage[]
  maxOutputTokens?: number
  metadata?: Record<string, unknown>
}

/**
 * RunChatOnceParams 类型
 */
export type RunChatOnceParams = {
  logicalModelId: LogicalModelId
  messages: ModelMessage[]
  maxOutputTokens?: number
  metadata?: Record<string, unknown>
}

export type StreamChatResult = ReturnType<typeof streamText>

export type RunChatOnceResult = {
  text: string
  raw: Awaited<ReturnType<typeof generateText>>
}

export const llmClient = {
  async streamChatRaw(params: StreamChatParams): Promise<StreamChatResult> {
    const { logicalModelId, messages, maxOutputTokens } = params
    const cfg = getModelConfig(logicalModelId)
    if (cfg.provider !== 'gateway') {
      throw new Error(`Provider ${cfg.provider} not implemented in streamChatRaw`)
    }

    //log.info({ logicalModelId, maxOutputTokens }, 'streamChatRaw')

    return streamText({
      model: cfg.modelId,
      messages,
      maxOutputTokens: maxOutputTokens ?? cfg.defaultMaxOutputTokens,
      onError: (error) => {
        log.error({ error }, 'streamText error')
      },
    })
  },

  async runChatOnce(params: RunChatOnceParams): Promise<RunChatOnceResult> {
    const { logicalModelId, messages, maxOutputTokens } = params
    const cfg = getModelConfig(logicalModelId)

    if (cfg.provider !== 'gateway') {
      throw new Error(`Provider ${cfg.provider} not implemented in runChatOnce`)
    }

    const result = await generateText({
      model: cfg.modelId,
      messages,
      maxOutputTokens: maxOutputTokens ?? cfg.defaultMaxOutputTokens,
    })

    return {
      text: result.text,
      raw: result,
    }
  },
}
