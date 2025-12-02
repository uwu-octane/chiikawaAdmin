import { Hono } from 'hono'
import { chatController } from '@/ai/channel/chat/chat-controller'
import type { ChatRequestBody } from '@/ai/channel/chat/chat-mapper'

const router = new Hono()

router.post('/chat', async (c) => {
  const body = (await c.req.json()) as ChatRequestBody
  const response = await chatController.handleChatRequest(body)
  return response
})

export default router
