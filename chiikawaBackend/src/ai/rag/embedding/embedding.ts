import config from '@/config/config'
import { OpenAI } from 'openai'

const apiKey = config.qwen.apiKey
const embeddingModel = config.qwen.embeddingModel
const dimEnv = config.qwen.embedDimensions
const embeddingBaseUrl = config.qwen.embeddingBaseUrl

let dimensions: number | undefined
if (dimEnv) {
  const parsed = Number(dimEnv)
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error(`EMBED_DIMENSIONS must be a positive number, got: ${dimEnv}`)
  }
  dimensions = parsed
}

const embeddingClient = new OpenAI({ apiKey: apiKey, baseURL: embeddingBaseUrl })

export async function embed(texts: string[]): Promise<Float32Array[]> {
  const res = await embeddingClient.embeddings.create({
    model: embeddingModel!,
    input: texts,
    ...(dimensions ? { dimensions: dimensions } : {}),
  })
  return res.data.map((d: { embedding: number[] }) => Float32Array.from(d.embedding))
}
