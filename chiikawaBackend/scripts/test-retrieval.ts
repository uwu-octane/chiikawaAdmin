import { retrieval } from '@/ai/rag/retrieval/retrieval'

async function testRetrieval() {
  try {
    const queries = ['Wer sind die Gründer?', 'KI', 'Dingolfing']

    for (const query of queries) {
      console.log(`\n=== Testing retrieval with query: "${query}" ===`)
      const results = await retrieval(query, 5, 0.2)
      console.log(`Found ${results.length} results:`)
      results.forEach((r, i) => {
        console.log(`\n${i + 1}. Score: ${r.score.toFixed(4)}`)
        console.log(`   ID: ${r.id}`)
        console.log(`   Question: ${r.question}`)
        console.log(`   Answer: ${r.answer.substring(0, 100)}...`)
      })
    }
  } catch (error) {
    console.error('Error testing retrieval:', error)
    process.exit(1)
  }
}

testRetrieval()
