import type { ModelMessage } from 'ai'

export function appendMessages(
  history: ModelMessage[],
  newMessages: ModelMessage[],
): ModelMessage[] {
  return history.concat(newMessages.filter((m) => m.role !== 'system'))
}

export function rewriteLastUserMessage(messages: ModelMessage[], newInput: string): ModelMessage[] {
  const next = [...messages]

  for (let i = next.length - 1; i >= 0; i--) {
    if (next[i].role === 'user') {
      next[i] = {
        role: 'user',
        content: newInput,
      }
      break
    }
  }

  return next
}
