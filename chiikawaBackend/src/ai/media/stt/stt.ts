// src/stt/qwen-asr-mic-demo.ts
import record from 'node-record-lpcm16'
import { createQwenAsrSession } from './client'
import { llmClient } from '@/ai/llm/client'
import type { ModelMessage } from 'ai'
import { createQwenTtsSession } from '../tts/client'

async function main() {
  console.log('[MIC-ASR] starting microphone transcription demo...')

  const messages: ModelMessage[] = [
    {
      role: 'system',
      content:
        'You are a voice assistant, answer in a concise manner to facilitate voice conversation reading.',
    },
  ]
  let isStreaming = false
  let turnIndex = 0
  let canTalk = false

  const ttsSession = await createQwenTtsSession({
    voice: 'Cherry',
  })

  setupPushToTalkKey(() => {
    canTalk = true
    console.log(
      '\n[PTT] Listening... (this round of recognition will automatically stop after speaking)',
    )
  })
  // Create a WebSocket session to Qwen-ASR
  const session = await createQwenAsrSession(
    {
      sampleRate: 16000,
      language: 'en',
      useVad: true,
    },
    {
      onReady: () => {
        console.log('[MIC-ASR] Qwen session ready, press spacebar to start speaking')
      },
      onPartial: (text) => {
        // streaming partial results
        process.stdout.write(`\r[partial] ${text}       `)
      },
      onFinal:
        // final result of each round according to VAD
        async (text) => {
          if (!text.trim()) return

          canTalk = false
          console.log('\n[PTT] press spacebar to start speaking')

          turnIndex++
          console.log(`\n[User ${turnIndex}] ${text}`)

          messages.push({
            role: 'user',
            content: text,
          })

          if (isStreaming) {
            console.log('waiting for the previous turn to finish...')
            return
          }
          isStreaming = true
          try {
            const result = await llmClient.streamChatRaw({
              logicalModelId: 'fast-chat' as const,
              messages: messages,
            })
            process.stdout.write(`[ASSISTANT ${turnIndex}] `)
            let fullText = ''
            for await (const textPart of result.textStream) {
              process.stdout.write(textPart)
              fullText += textPart
              ttsSession.appendText(textPart)
            }
            console.log('\n')
            messages.push({
              role: 'assistant',
              content: fullText,
            })
            ttsSession.commit()
          } catch (err) {
            console.error('[MIC-ASR] error:', err)
          } finally {
            isStreaming = false
          }
        },
      onError: (err) => {
        console.error('\n[MIC-ASR] ASR error:', err)
      },
      onClose: (code, reason) => {
        console.log(`\n[MIC-ASR] Qwen session closed: code=${code}, reason=${reason}`)
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
    // Send each chunk of microphone data to Qwen-ASR
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'binary')
    session.sendAudio(buf)
  })

  micStream.on('error', (err) => {
    console.error('\n[MIC-ASR] microphone stream error:', err)
    session.close(1011, 'mic error')
  })

  micStream.on('end', () => {
    console.log('\n[MIC-ASR] microphone stream ended')
    session.close(1000, 'mic end')
  })

  process.on('SIGINT', () => {
    console.log('\n[MIC-ASR] received SIGINT, stopping recording and closing session...')
    try {
      rec.stop()
    } catch (e) {
      console.error('[MIC-ASR] stop recorder error:', e)
    }
    session.close(1000, 'SIGINT')
    ttsSession.close()
    // wait for the logs to be printed
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
      // 手动触发 SIGINT，让上面的 cleanupAndExit 跑
      process.kill(process.pid, 'SIGINT')
      return
    }

    // 空格键：开始一轮说话
    if (key === ' ') {
      onStartTalk()
      return
    }
  })
}
main().catch((err) => {
  console.error('[MIC-ASR] fatal error:', err)
  process.exit(1)
})
