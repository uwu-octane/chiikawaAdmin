import { embed } from '@/ai/rag/embedding/embedding'
import { readFile } from 'fs/promises'
import { join } from 'path'

interface FaqItem {
  id: string
  question: string
  answer: string
  embedding: number[]
  tags?: string[]
}

interface RetrievedFaq {
  id: string
  question: string
  answer: string
  tags?: string
  score: number
}

interface EmbeddingsData {
  version: string
  createdAt: string
  items: FaqItem[]
}

// Cache for loaded embeddings
let cachedEmbeddings: FaqItem[] | null = null

/**
 * Load all FAQs from qa-embeddings.json
 */
async function getAllFaqs(): Promise<FaqItem[]> {
  if (cachedEmbeddings) {
    return cachedEmbeddings
  }

  try {
    const embeddingsPath = join(process.cwd(), 'qa-embeddings.json')
    const content = await readFile(embeddingsPath, 'utf-8')
    const data: EmbeddingsData = JSON.parse(content)
    cachedEmbeddings = data.items || []
    return cachedEmbeddings
  } catch (error) {
    console.error('Error loading embeddings:', error)
    return []
  }
}

/**
 * Convert number[] to Float32Array
 */
function toF32(arr: number[]): Float32Array {
  return Float32Array.from(arr)
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSim(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions mismatch: ${a.length} vs ${b.length}`)
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) {
    return 0
  }

  return dotProduct / denominator
}

export async function retrieval(
  query: string,
  k: number = 5,
  scoreThreshold: number = 0.5,
): Promise<RetrievedFaq[]> {
  if (!query || !query.trim()) return []
  console.log('doing vector retrieval')
  // generate query vector
  console.log('calling embed')
  const [qVec] = await embed([query])
  const qDim = qVec.length

  // retrieve all candidates (retrieve all embeddings for local computation)
  const rows = await getAllFaqs()

  if (!rows.length) return []

  // calculate similarity
  console.log('calculating cosine similarity')
  const scored: RetrievedFaq[] = []
  for (const r of rows) {
    const embedding = r.embedding
    if (!embedding || embedding.length === 0) continue

    const v = toF32(embedding)

    if (v.length !== qDim) continue

    const score = cosineSim(qVec, v)
    scored.push({
      id: r.id,
      question: r.question,
      answer: r.answer,
      tags: r.tags?.join(', '),
      score,
    })
  }

  if (!scored.length) return []

  // Filter by score threshold
  const filtered = scored.filter((item) => item.score >= scoreThreshold)

  if (!filtered.length) {
    console.log(`No results above threshold ${scoreThreshold}`)
    return []
  }

  console.log(`Found ${filtered.length} results above threshold ${scoreThreshold}`)

  // top k
  const limit = Number.isFinite(k) ? Math.max(1, Math.min(50, Math.floor(k))) : 5
  filtered.sort((a, b) => b.score - a.score)
  return filtered.slice(0, limit)
}

export function rerankMock() {
  console.log('rerankMock: doing reranking')
}

export function hybridRetrieval() {
  console.log('hybridRetrieval: doing hybrid retrieval')
}

export function bm25Search() {
  console.log('bm25Search: doing bm25 search')
}

export function resultProcess() {
  console.log('resultProcess: merging results')
  console.log('resultProcess: deduplicating results')
  console.log('resultProcess: sorting results')
  console.log('resultProcess: returning results')
}
