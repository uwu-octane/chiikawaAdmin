// src/ai/tools/common-info.ts
import { tool } from 'ai'
import { z } from 'zod'
import { retrieval } from '@/ai/rag/retrieval/retrieval'

export const commonInfoTool = tool({
  description:
    'Searches the internal FAQ document with general information about the agency PHILIPP. ' +
    'Use this tool to answer questions about topics such as: ' +
    'founders, ' +
    'services (web & app development, AI, digitalization & automation), ' +
    'project workflow and long-term support. ',

  inputSchema: z.object({
    query: z.string().min(3).describe('The user’s concrete question about the agency PHILIPP.'),
    k: z
      .number()
      .int()
      .min(1)
      .max(10)
      .optional()
      .describe('How many of the most relevant FAQ entries should be returned. Default: 5.'),
  }),

  async execute({ query, k }) {
    let usedFallback = false
    let results = await retrieval(query, k ?? 5, 0.5)

    if (!results.length) {
      console.log('[commonInfoTool] no results with threshold 0.5, trying fallback with 0.3')
      usedFallback = true
      results = await retrieval(query, k ?? 5, 0.3)
    }

    if (!results.length) {
      return {
        found: false,
        usedFallback,
        message: 'No clearly relevant answer was found in the local FAQ knowledge base.',
        items: [] as any[],
      }
    }

    return {
      found: true,
      topAnswer: {
        id: results[0].id,
        question: results[0].question,
        answer: results[0].answer,
        score: results[0].score,
        tags: results[0].tags,
      },
      items: results.map((r) => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        score: r.score,
        tags: r.tags,
      })),
    }
  },
})
