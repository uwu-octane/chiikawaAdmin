import '@/ai/llm/provider'
import { generateText } from 'ai'
import type { ModelMessage } from 'ai'
import { loadSystemPrompt } from '@/ai/llm/loadPrompt'
import { getModelConfig } from '@/ai/llm/model'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { baseLogger } from '@/logger/logger'

const __dirname = dirname(fileURLToPath(import.meta.url))

const log = baseLogger.getSubLogger({ name: 'Rewriter' })
/**
 * Rewrites user input based on conversation history for coreference resolution
 * @param input - The input text
 * @param history - The optional conversation history
 * @returns The rewritten input, or original input if error occurs
 */
export async function rewriteInput(history: ModelMessage[]): Promise<string> {
  try {
    // Load prompt from the same directory
    const promptPath = join(__dirname, 'prompt.yaml')
    const { systemPrompt } = await loadSystemPrompt(promptPath)
    // Call LLM to rewrite
    // Filter out messages with role='tool'
    //const filteredHistory = history.filter((msg) => msg.role !== 'tool')
    log.info({ history }, 'History')
    const result = await generateText({
      model: getModelConfig('smart-chat').modelId,
      messages: history,
      system: systemPrompt,
      maxOutputTokens: 800,
    })

    const rewritten = result.text.trim()
    log.info({ rewritten }, 'Rewritten input')
    return rewritten
  } catch (error) {
    // On error, return original input
    log.error({ error }, 'Error during rewrite')
    return ''
  }
}
