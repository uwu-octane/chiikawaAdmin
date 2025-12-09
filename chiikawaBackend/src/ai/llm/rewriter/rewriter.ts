import '@/ai/llm/provider'
import { generateText } from 'ai'
import type { ModelMessage } from 'ai'
import { loadSystemPrompt } from '@/ai/llm/loadPrompt'
import { getModelConfig } from '@/ai/llm/model'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Rewrites user input based on conversation history for coreference resolution
 * @param input - The input text
 * @param history - The optional conversation history
 * @returns The rewritten input, or original input if error occurs
 */
export async function rewriteInput(input: string, history?: ModelMessage[]): Promise<string> {
  try {
    // Load prompt from the same directory
    const promptPath = join(__dirname, 'prompt.yaml')
    const { systemPrompt } = await loadSystemPrompt(promptPath)

    // Build messages: history + current user input
    const messages: ModelMessage[] = [...history]
    messages.push({
      role: 'user',
      content: input,
    })

    // Call LLM to rewrite
    const result = await generateText({
      model: getModelConfig('fast-chat').modelId,
      messages,
      system: systemPrompt,
      maxOutputTokens: 200,
    })

    const rewritten = result.text.trim()
    console.log('[REWRITER] Rewritten input:', rewritten)
    return rewritten || input
  } catch (error) {
    // On error, return original input
    console.error('[REWRITER] Error during rewrite:', error)
    return input
  }
}
