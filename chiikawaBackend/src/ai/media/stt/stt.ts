// src/stt/qwen-asr-mic-demo.ts
import '@/ai/llm/provider'
import record from 'node-record-lpcm16'
import { createQwenAsrSession } from './client'
import type { ModelMessage } from 'ai'
import { createQwenTtsSession } from '../tts/client'
import { rewriteLastUserMessage } from '@/ai/conversation/conversation'
import { rewriteInput } from '@/ai/llm/rewriter/rewriter'
import { createReceptionAgent } from '@/ai/llm/assistant/assistant'

async function main() {
  console.log('[STT] Initializing microphone transcription system...')

  let messages: ModelMessage[] = []
  const assistantAgent = await createReceptionAgent()

  let isStreaming = false
  let turnIndex = 0
  let canTalk = false

  console.log('[TTS] Initializing text-to-speech session...')
  const ttsSession = await createQwenTtsSession({
    voice: 'Cherry',
  })
  console.log('[TTS] Session ready')

  setupPushToTalkKey(() => {
    canTalk = true
    console.log('[PTT] Listening... (recognition will stop automatically after speaking)')
  })

  console.log('[ASR] Creating Qwen ASR session...')
  const session = await createQwenAsrSession(
    {
      sampleRate: 16000,
      useVad: true,
    },
    {
      onReady: () => {
        console.log('[ASR] Session ready')
        console.log('[PTT] Press spacebar to start speaking')
      },
      onPartial: (text) => {
        process.stdout.write(`\r[ASR] Partial: ${text.padEnd(50)}`)
      },
      onFinal: async (text) => {
        if (!text.trim()) return

        canTalk = false
        process.stdout.write('\r' + ' '.repeat(60) + '\r')

        turnIndex++
        console.log(`[Turn ${turnIndex}] User: ${text}`)

        messages.push({
          role: 'user',
          content: text,
        })

        if (messages.length > 20) {
          messages = messages.slice(-20)
        }

        if (isStreaming) {
          console.log('[LLM] Waiting for previous response to complete...')
          return
        }
        try {
          // get last 20 messages

          if (messages.length === 0) {
            console.log('[REWRITE] No history messages, skipping rewrite')
          } else {
            const rewrittenUserMessage = await rewriteInput(text, messages)
            messages = rewriteLastUserMessage(messages, rewrittenUserMessage)
          }
        } catch (err) {
          console.error('[LLM] Error:', err)
        }

        isStreaming = true
        try {
          console.log('[LLM] Processing request...')
          //   const result = await llmClient.streamChatRaw({
          //     logicalModelId: 'fast-chat' as const,
          //     messages: messages,
          //   })

          const result = await assistantAgent.stream({
            messages: messages,
          })
          process.stdout.write(`[Turn ${turnIndex}] Assistant: `)
          for await (const textPart of result.textStream) {
            process.stdout.write(textPart)
            ttsSession.appendText(textPart)
          }
          console.log('')
          const { messages: updatedMessages } = await result.response
          messages = updatedMessages
          ttsSession.commit()
          console.log('[TTS] Response queued for playback')
          console.log('[PTT] Press spacebar to continue')
        } catch (err) {
          console.error('[LLM] Error:', err)
        } finally {
          isStreaming = false
        }
      },
      onError: (err) => {
        console.error('[ASR] Error:', err)
      },
      onClose: (code, reason) => {
        console.log(`[ASR] Session closed: code=${code}, reason=${reason}`)
      },
    },
  )
  const rec = record.record({
    sampleRate: 16000,
    channels: 1,
    threshold: 0, // no local silence detection, let VAD handle it
    endOnSilence: false,
    audioType: 'raw',
    recorder: 'sox',
  })

  const micStream = rec.stream()

  micStream.on('data', (chunk: Buffer) => {
    if (!canTalk) return
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'binary')
    session.sendAudio(buf)
  })

  micStream.on('error', (err) => {
    console.error('[MIC] Stream error:', err)
    session.close(1011, 'mic error')
  })

  micStream.on('end', () => {
    console.log('[MIC] Stream ended')
    session.close(1000, 'mic end')
  })

  process.on('SIGINT', () => {
    console.log('\n[STT] Shutting down...')
    try {
      rec.stop()
      console.log('[MIC] Recording stopped')
    } catch (e) {
      console.error('[MIC] Stop recorder error:', e)
    }
    session.close(1000, 'SIGINT')
    ttsSession.close()
    console.log('[STT] Cleanup complete')
    setTimeout(() => process.exit(0), 500)
  })
}
function setupPushToTalkKey(onStartTalk: () => void) {
  const stdin = process.stdin
  stdin.setRawMode?.(true)
  stdin.resume()
  stdin.setEncoding('utf8')

  stdin.on('data', (key: string) => {
    // Ctrl+C
    if (key === '\u0003') {
      process.kill(process.pid, 'SIGINT')
      return
    }

    if (key === ' ') {
      onStartTalk()
      return
    }
  })
}
main().catch((err) => {
  console.error('[STT] Fatal error:', err)
  process.exit(1)
})
