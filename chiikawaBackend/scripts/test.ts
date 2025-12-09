import { embed } from '@/ai/rag/embedding/embedding'

const text = 'Hello, world!'
const embedding = await embed([text])
console.log(embedding)
