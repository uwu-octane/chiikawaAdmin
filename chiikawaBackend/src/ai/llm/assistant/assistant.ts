import '@/ai/llm/provider'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Experimental_Agent as Agent, stepCountIs, type StepResult, type ToolSet } from 'ai'
import { loadSystemPrompt } from '@/ai/llm/loadPrompt'
import { getModelConfig } from '@/ai/llm/model'
import { tools } from '@/ai/rag/tools'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'Assistant' })

const __dirname = dirname(fileURLToPath(import.meta.url))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createReceptionAgent(): Promise<any> {
  const modelConfig = getModelConfig('smart-chat')
  const { systemPrompt } = await loadSystemPrompt(join(__dirname, 'prompt.yaml'))
  const agent = new Agent({
    model: modelConfig.modelId,
    instructions: systemPrompt,
    tools: tools,
    toolChoice: 'auto',
    maxOutputTokens: modelConfig.defaultMaxOutputTokens ?? 1000,
    maxRetries: 2,
    stopWhen: stepCountIs(4),
    onStepFinish: (stepResult) => {
      logStep(stepResult)
    },
  })

  return agent
}

let stepCounter = 0

function logStep<TOOLS extends ToolSet>(stepResult: StepResult<TOOLS>) {
  stepCounter += 1

  const { text, toolCalls, toolResults, finishReason, usage } = stepResult

  log.info('\n================ [AGENT STEP FINISHED] ================')
  log.info({ stepCounter }, 'Step #:')
  log.info({ finishReason }, 'finishReason')
  log.info({ text: text.slice(0, 120) }, 'text (preview)')

  if (toolCalls.length === 0) {
    log.info('Tool calls: none')
  } else {
    log.info(`Tool calls (${toolCalls.length}):`)
    for (const call of toolCalls) {
      log.info({ toolName: call.toolName }, `- tool: ${call.toolName}`)
      log.info({ toolCallId: call.toolCallId }, `  id:   ${call.toolCallId}`)
      log.info({ input: call.input }, `  args: ${JSON.stringify(call.input)}`)
    }
  }

  if (toolResults.length > 0) {
    log.info(`Tool results (${toolResults.length}):`)
    for (const res of toolResults) {
      log.info({ output: res.output }, `  output: ${JSON.stringify(res.output)}`)
    }
  }

  log.info({ usage }, 'usage')
  log.info('=======================================================\n')
}
