import '@/ai/llm/provider'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Experimental_Agent as Agent, stepCountIs, type StepResult, type ToolSet } from 'ai'
import { loadSystemPrompt } from '@/ai/llm/loadPrompt'
import { getModelConfig } from '@/ai/llm/model'
import { tools } from '@/ai/rag/tools'

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

  console.log('\n================ [AGENT STEP FINISHED] ================')
  console.log('Step #:', stepCounter)
  console.log('finishReason:', finishReason)
  console.log('text (preview):', text.slice(0, 120))

  if (toolCalls.length === 0) {
    console.log('Tool calls: none')
  } else {
    console.log(`Tool calls (${toolCalls.length}):`)
    for (const call of toolCalls) {
      console.log(`- tool: ${call.toolName}`)
      console.log(`  id:   ${call.toolCallId}`)
      console.log(`  args: ${JSON.stringify(call.input)}`)
    }
  }

  if (toolResults.length > 0) {
    console.log(`Tool results (${toolResults.length}):`)
    for (const res of toolResults) {
      console.log(`  output: ${JSON.stringify(res.output)}`)
    }
  }

  console.log('usage:', usage)
  console.log('=======================================================\n')
}
