// src/routes/chat-debug.ts
import { Hono } from 'hono'

const router = new Hono()

router.get('/chat-debug', (c) => {
  const encoder = new TextEncoder()

  const fullText =
    '你好，这里是一个使用 Bun ReadableStream 模拟的大段测试文本，用来排查在长回复场景下，' +
    '到底是 DeepSeek、ai-sdk，还是 Bun/Hono 的流式传输出了问题。' +
    '如果你能在 curl 输出中完整看到这一整段话，并且连接能够正常结束而不报错，' +
    '那么说明 Bun + Hono 的基础 SSE 能力是正常的，问题更可能出在对上游 LLM 的集成逻辑上。' +
    '相反，如果在输出过程中，curl 提示 transfer closed with outstanding read data remaining，' +
    '就意味着在没有把所有数据发完之前，连接已经被某一层意外关闭了。' +
    '现在我们会把这段话拆成多段 text-delta，一段一段推给客户端，以模拟真实的流式 AI 回复。'

  let closed = false
  let timer: ReturnType<typeof setInterval> | undefined

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let index = 0
      const chunkSize = 8 // 每次推送几个字符

      timer = setInterval(() => {
        if (closed) {
          if (timer) clearInterval(timer)
          return
        }

        // 文本发完，正常收尾
        if (index >= fullText.length) {
          if (timer) clearInterval(timer)

          const finishPayload = { type: 'finish', id: 'debug-0' }
          const finishChunk = `data: ${JSON.stringify(finishPayload)}\n\n`

          try {
            controller.enqueue(encoder.encode(finishChunk))
          } catch (err) {
            console.error('[chat-debug] enqueue after finish error:', err)
          }

          controller.close()
          closed = true
          console.log('[chat-debug] stream finished normally')
          return
        }

        const deltaText = fullText.slice(index, index + chunkSize)
        index += chunkSize

        const payload = {
          type: 'text-delta',
          id: 'debug-0',
          delta: deltaText,
        }
        const chunk = `data: ${JSON.stringify(payload)}\n\n`

        try {
          controller.enqueue(encoder.encode(chunk))
          console.log('[chat-debug] send delta:', payload.delta)
        } catch (err) {
          // 如果在 close 之后还误发，会走到这里，防止崩溃
          console.error('[chat-debug] enqueue error:', err)
          closed = true
          if (timer) clearInterval(timer)
        }
      }, 200)
    },
    cancel(reason) {
      closed = true
      if (timer) clearInterval(timer)
      console.log('[chat-debug] stream canceled:', reason)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

export default router
