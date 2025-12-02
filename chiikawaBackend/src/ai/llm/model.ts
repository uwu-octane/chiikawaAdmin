import { z } from 'zod'

/**
 * LLM 任务类型 Schema & 类型
 */
export const LlmTaskTypeSchema = z.enum(['chat', 'summary', 'reasoning'])
export type LlmTaskType = z.infer<typeof LlmTaskTypeSchema>

/**
 * 逻辑模型 ID Schema & 类型
 */
export const LogicalModelIdSchema = z.enum(['fast-chat', 'smart-chat', 'summary'])
export type LogicalModelId = z.infer<typeof LogicalModelIdSchema>

/**
 * Provider 类型 Schema & 类型
 */
export const ProviderKindSchema = z.enum(['deepseek', 'openai', 'qwen', 'gateway'])
export type ProviderKind = z.infer<typeof ProviderKindSchema>

/**
 * 模型配置 Schema & 类型
 */
export const ResolvedModelConfigSchema = z.object({
  id: LogicalModelIdSchema,
  task: LlmTaskTypeSchema,
  provider: ProviderKindSchema,
  modelId: z.string(),
  isFast: z.boolean().optional(),
  isReasoningCapable: z.boolean().optional(),
  isToolCallingCapable: z.boolean().optional(),
  defaultMaxOutputTokens: z.number().int().positive().optional(),
  defaultTemperature: z.number().min(0).max(2).optional(),
  defaultTopP: z.number().min(0).max(1).optional(),
})
export type ResolvedModelConfig = z.infer<typeof ResolvedModelConfigSchema>

/**
 * 所有逻辑模型配置的 Schema & 类型
 */
export const LlmModelsSchema = z.record(LogicalModelIdSchema, ResolvedModelConfigSchema)
export type LlmModels = z.infer<typeof LlmModelsSchema>

const RAW_LLM_MODELS = {
  'fast-chat': {
    id: 'fast-chat',
    task: 'chat',
    provider: 'gateway',
    modelId: 'deepseek/deepseek-v3.2-exp',
    isFast: true,
  },
  'smart-chat': {
    id: 'smart-chat',
    task: 'chat',
    provider: 'gateway',
    modelId: 'deepseek/deepseek-v3.2-exp-thinking',
    isFast: false,
    isReasoningCapable: true,
  },
  summary: {
    id: 'summary',
    task: 'summary',
    provider: 'gateway',
    modelId: 'deepseek/deepseek-v3.2-exp',
    isFast: false,
  },
} as const satisfies LlmModels

/**
 * 通过 Zod 校验过的模型配置表
 */
export const LLM_MODELS: LlmModels = LlmModelsSchema.parse(RAW_LLM_MODELS)

export function getModelConfig(id: LogicalModelId): ResolvedModelConfig {
  const cfg = LLM_MODELS[id]
  if (!cfg) {
    throw new Error(`Unknown logical model id: ${id}`)
  }
  return cfg
}

export type ModelSelectionHint = {
  task: LlmTaskType
  preferFast?: boolean
  forceSmart?: boolean
}
