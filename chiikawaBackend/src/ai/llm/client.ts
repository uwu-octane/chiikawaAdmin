import '@/ai/llm/provider'
import { streamText, type ModelMessage, generateText } from 'ai'
import { z } from 'zod'
import { getModelConfig, LogicalModelIdSchema } from './model'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'llmClient' })
/**
 * StreamChatParams 的 Zod Schema & 类型
 */
export const StreamChatParamsSchema = z.object({
  logicalModelId: LogicalModelIdSchema,
  messages: z.array(z.custom<ModelMessage>()),
  maxOutputTokens: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type StreamChatParams = z.infer<typeof StreamChatParamsSchema>

/**
 * RunChatOnceParams 的 Zod Schema & 类型
 */
export const RunChatOnceParamsSchema = z.object({
  logicalModelId: LogicalModelIdSchema,
  messages: z.array(z.custom<ModelMessage>()),
  maxOutputTokens: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type RunChatOnceParams = z.infer<typeof RunChatOnceParamsSchema>

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

    log.info({ logicalModelId, maxOutputTokens }, 'streamChatRaw')
    // const deepseek = createDeepSeek({
    //   apiKey: config.app.testKey,
    // })

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
