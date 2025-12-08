// src/stt/qwen-asr-client.ts
import WebSocket from 'ws'
import crypto from 'node:crypto'
import config from '@/config/config'

const apiKey = config.qwen.apiKey
const wsUrl = config.qwen.wsUrl
if (!apiKey || !wsUrl) {
  throw new Error('[Qwen-ASR] need QWEN_KEY and QWEN_REALTIME_BASE_URL')
}

const MODEL_NAME = config.qwen.asrModel
const QWEN_WS_URL = `${wsUrl}?model=${MODEL_NAME}`

export type QwenAsrSessionConfig = {
  sampleRate?: number // default 16000
  language?: string // default 'en'
  useVad?: boolean // default true
}

export type QwenAsrCallbacks = {
  onReady?: () => void
  onPartial?: (text: string) => void
  onFinal?: (text: string) => void
  onError?: (err: Error) => void
  onClose?: (code: number, reason: string) => void
}

export type QwenAsrSession = {
  /**
   * Send a chunk of PCM audio (16-bit, mono)
   */
  sendAudio: (chunk: Buffer) => void
  /**
   * Close the session
   */
  close: (code?: number, reason?: string) => void
}

function createEventId(prefix: string) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`
}

/**
 * Create a WebSocket session to Qwen real-time ASR.
 */
export async function createQwenAsrSession(
  config: QwenAsrSessionConfig = {},
  callbacks: QwenAsrCallbacks = {},
): Promise<QwenAsrSession> {
  const { sampleRate = 16000, language = 'en', useVad = true } = config

  const { onReady, onPartial, onFinal, onError, onClose } = callbacks

  return new Promise<QwenAsrSession>((resolve, reject) => {
    console.log('[Qwen-ASR] connecting to WebSocket:', QWEN_WS_URL)
    console.log('[Qwen-ASR] API Key is set:', apiKey ? `${apiKey.substring(0, 8)}...` : 'not set')

    const ws = new WebSocket(QWEN_WS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    let sessionCreated = false

    ws.on('open', () => {
      console.log('[Qwen-ASR] WS connected to:', QWEN_WS_URL)

      // Send session.update to configure sample rate, language, and VAD
      const sessionUpdatePayload = {
        event_id: createEventId('session'),
        type: 'session.update',
        session: {
          input_audio_format: 'pcm',
          sample_rate: sampleRate,
          input_audio_transcription: {
            language,
          },
          turn_detection: useVad
            ? {
                type: 'server_vad',
                threshold: 0.7,
                silence_duration_ms: 800,
              }
            : null,
        },
      }

      ws.send(JSON.stringify(sessionUpdatePayload))

      const session: QwenAsrSession = {
        sendAudio(chunk: Buffer) {
          if (ws.readyState !== WebSocket.OPEN) {
            console.warn('[Qwen-ASR] WS not open, drop audio chunk')
            return
          }
          const audioB64 = chunk.toString('base64')
          const event = {
            event_id: createEventId('audio'),
            type: 'input_audio_buffer.append',
            audio: audioB64,
          }
          ws.send(JSON.stringify(event))
        },
        close(code = 1000, reason = 'client close') {
          try {
            ws.close(code, reason)
          } catch (e) {
            console.error('[Qwen-ASR] close error:', e)
          }
        },
      }

      // Resolve the session object once the connection is open, allowing the caller to start sending audio immediately
      resolve(session)
    })

    ws.on('message', (raw) => {
      let msg: { type?: string; [key: string]: unknown }
      try {
        msg = JSON.parse(raw.toString('utf-8')) as { type?: string; [key: string]: unknown }
      } catch {
        console.warn('[Qwen-ASR] invalid JSON from server:', raw.toString())
        return
      }

      const type = msg.type
      if (!type) return

      switch (type) {
        case 'session.created': {
          sessionCreated = true
          const session = msg.session as { id?: string } | undefined
          console.log('[Qwen-ASR] session created:', session?.id)
          onReady?.()
          break
        }

        case 'input_audio_buffer.speech_started':
          console.log('>>> [VAD] speech started')
          break

        case 'input_audio_buffer.speech_stopped':
          console.log('<<< [VAD] speech stopped')
          break

        case 'conversation.item.input_audio_transcription.text': {
          const text = msg.text as string
          // partial result
          onPartial?.(text)
          break
        }

        case 'conversation.item.input_audio_transcription.completed': {
          const transcript = msg.transcript as string
          onFinal?.(transcript)
          console.log('[Qwen-ASR] final:', transcript)
          break
        }

        default:
          // console.log('[Qwen-ASR] event:', type, msg)
          break
      }
    })

    ws.on('error', (err) => {
      console.error('[Qwen-ASR] WS error:', err)
      console.error('[Qwen-ASR] Error details:', {
        message: err.message,
        type: err.type,
        target: err.target?.url,
      })
      onError?.(err as Error)
      if (!sessionCreated) {
        // If the error occurs before the session is established, reject immediately
        reject(err)
      }
    })

    ws.on('close', (code, reason) => {
      console.log('[Qwen-ASR] WS closed:', code, reason.toString())
      onClose?.(code, reason.toString())
    })
  })
}
