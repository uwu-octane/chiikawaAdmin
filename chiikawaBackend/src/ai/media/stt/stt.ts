// src/stt/qwen-asr-mic-demo.ts
import '@/ai/llm/provider'
import record from 'node-record-lpcm16'
import { createQwenAsrSession } from './client'
import type { ModelMessage } from 'ai'
import { createQwenTtsSession } from '../tts/client'
import { rewriteLastUserMessage } from '@/ai/conversation/conversation'
import { rewriteInput } from '@/ai/llm/rewriter/rewriter'
import { createReceptionAgent } from '@/ai/llm/assistant/assistant'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'STT' })

async function main() {
  log.info('[STT] Initializing microphone transcription system...')

  let messages: ModelMessage[] = []
  const assistantAgent = await createReceptionAgent()

  let isStreaming = false
  let turnIndex = 0
  let canTalk = false

  log.info('[TTS] Initializing text-to-speech session...')
  const ttsSession = await createQwenTtsSession({
    voice: 'Cherry',
  })
  log.info('[TTS] Session ready')

  setupPushToTalkKey(() => {
    canTalk = true
    log.info('[PTT] Listening... (recognition will stop automatically after speaking)')
  })

  log.info('[ASR] Creating Qwen ASR session...')
  const session = await createQwenAsrSession(
    {
      sampleRate: 16000,
      useVad: true,
    },
    {
      onReady: () => {
        log.info('[ASR] Session ready')
        log.info('[PTT] Press spacebar to start speaking')
      },
      onPartial: (text) => {
        process.stdout.write(`\r[ASR] Partial: ${text.padEnd(50)}`)
      },
      onFinal: async (text) => {
        if (!text.trim()) return

        canTalk = false
        process.stdout.write('\r' + ' '.repeat(60) + '\r')

        turnIndex++
        log.info(`[Turn ${turnIndex}] User: ${text}`)

        messages.push({
          role: 'user',
          content: text,
        })
        log.info('[MESSAGES] Messages length:', messages.length)
        if (messages.length > 20) {
          messages = messages.slice(-20)
        }

        if (isStreaming) {
          log.info('[LLM] Waiting for previous response to complete...')
          return
        }
        try {
          if (messages.length === 0) {
            log.info('[REWRITE] No history messages, skipping rewrite')
          } else {
            const rewrittenUserMessage = await rewriteInput(messages)
            if (rewrittenUserMessage) {
              messages = rewriteLastUserMessage(messages, rewrittenUserMessage)
            }
            log.info('[REWRITE] Rewritten messages:', messages)
          }
        } catch (err) {
          log.error('[LLM] Error:', err)
        }

        isStreaming = true
        try {
          log.info('[LLM] Processing request...')

          const result = await assistantAgent.stream({
            messages: messages,
          })
          process.stdout.write(`[Turn ${turnIndex}] Assistant: `)
          for await (const textPart of result.textStream) {
            process.stdout.write(textPart)
            ttsSession.appendText(textPart)
          }
          log.info('')
          const { messages: updatedMessages } = await result.response
          messages = updatedMessages
          ttsSession.commit()
          log.info('[TTS] Response queued for playback')
          log.info('[PTT] Press spacebar to continue')
        } catch (err) {
          log.error('[LLM] Error:', err)
        } finally {
          isStreaming = false
        }
      },
      onError: (err) => {
        log.error('[ASR] Error:', err)
      },
      onClose: (code, reason) => {
        log.info(`[ASR] Session closed: code=${code}, reason=${reason}`)
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
    log.error('[MIC] Stream error:', err)
    session.close(1011, 'mic error')
  })

  micStream.on('end', () => {
    log.info('[MIC] Stream ended')
    session.close(1000, 'mic end')
  })

  process.on('SIGINT', () => {
    log.info('\n[STT] Shutting down...')
    try {
      rec.stop()
      log.info('[MIC] Recording stopped')
    } catch (e) {
      log.error('[MIC] Stop recorder error:', e)
    }
    session.close(1000, 'SIGINT')
    ttsSession.close()
    log.info('[STT] Cleanup complete')
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
  log.error('[STT] Fatal error:', err)
  process.exit(1)
})
