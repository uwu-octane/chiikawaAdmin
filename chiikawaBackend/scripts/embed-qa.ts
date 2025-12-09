import { embed } from '@/ai/rag/embedding/embedding'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface QaItem {
  id: string
  question: string
  answer: string
}

interface EmbeddedQaItem extends QaItem {
  embedding: number[]
}

async function embedQa() {
  try {
    // Read qa.json
    const qaPath = join(process.cwd(), 'qa.json')
    console.log(`Reading QA file from: ${qaPath}`)
    const qaContent = await readFile(qaPath, 'utf-8')
    const qaData = JSON.parse(qaContent)

    // Extract all QA items
    const qaItems: QaItem[] = qaData.general || []
    console.log(`Found ${qaItems.length} QA items`)

    if (qaItems.length === 0) {
      console.log('No QA items found')
      return
    }

    // Prepare texts for embedding (combine question + answer for better context)
    const texts = qaItems.map((item) => `Question: ${item.question}\nAnswer: ${item.answer}`)
    console.log('Generating embeddings...')

    // Generate embeddings in batches (API limit: max 10 per batch)
    const batchSize = 10
    const embeddings: Float32Array[] = []

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize)
      console.log(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)} (${batch.length} items)`,
      )
      const batchEmbeddings = await embed(batch)
      embeddings.push(...batchEmbeddings)
    }

    console.log(`Generated ${embeddings.length} embeddings`)

    // Combine QA items with embeddings
    const embeddedQaItems: EmbeddedQaItem[] = qaItems.map((item, index) => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      embedding: Array.from(embeddings[index]),
    }))

    // Save to file
    const outputPath = join(process.cwd(), 'qa-embeddings.json')
    const outputData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      items: embeddedQaItems,
    }

    await writeFile(outputPath, JSON.stringify(outputData, null, 2), 'utf-8')
    console.log(`Saved embeddings to: ${outputPath}`)
    console.log(`Total items: ${embeddedQaItems.length}`)
    console.log(`Embedding dimensions: ${embeddedQaItems[0]?.embedding.length || 0}`)
  } catch (error) {
    console.error('Error embedding QA:', error)
    process.exit(1)
  }
}

embedQa()
