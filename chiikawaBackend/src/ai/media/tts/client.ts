import config from '@/config/config'
import WebSocket from 'ws'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { baseLogger } from '@/logger/logger'

const log = baseLogger.getSubLogger({ name: 'Qwen-TTS' })

const apiKey = config.qwen.apiKey
const wsUrl = config.qwen.wsUrl
if (!apiKey || !wsUrl) {
  throw new Error('[Qwen-TTS] need QWEN_KEY and QWEN_REALTIME_BASE_URL')
}

const MODEL_NAME = config.qwen.ttsModel
const QWEN_WS_URL = `${wsUrl}?model=${MODEL_NAME}`

export type QwenTtsConfig = {
  voice?: string
}
export type QwenTtsSession = {
  //Append text fragment by fragment (e.g. LLM's textStream token)
  appendText: (fragment: string) => void
  commit: () => void
  close: () => void
}

export function createQwenTtsSession(cfg: QwenTtsConfig): Promise<QwenTtsSession> {
  return new Promise<QwenTtsSession>((resolve, reject) => {
    const ws = new WebSocket(QWEN_WS_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })
    log.info('[Qwen-TTS] connecting to:', wsUrl)

    const player: ChildProcessWithoutNullStreams = spawn('play', [
      '-t',
      'raw',
      '-r',
      '24000',
      '-e',
      'signed',
      '-b',
      '16',
      '-c',
      '1',
      '-',
    ])

    player.stderr.on('data', () => {
      // Ignore stderr output from sox play
    })

    player.on('exit', (code, signal) => {
      if (code !== 0 && code !== null) {
        log.error(`[Qwen-TTS][sox] exit with error: code=${code} signal=${signal ?? ''}`)
      } else {
        log.info(`[Qwen-TTS][sox] exit: code=${code ?? ''} signal=${signal ?? ''}`)
      }
    })

    let ready = false
    let sessionCreated = false

    function send(event: { event_id: string; type: string; [key: string]: unknown }) {
      if (ws.readyState !== WebSocket.OPEN) {
        log.warn('[Qwen-TTS] WS not open, drop event:', event?.type)
        return
      }
      ws.send(JSON.stringify(event))
    }

    ws.on('open', () => {
      log.info('[Qwen-TTS] WS connected')

      send({
        event_id: randomUUID(),
        type: 'session.update',
        session: {
          mode: 'server_commit',
          voice: cfg.voice,
          speech_rate: 1.3,
          response_format: 'pcm',
        },
      })

      ready = true

      // Resolve the promise once WebSocket is open
      resolve({
        appendText,
        commit,
        close,
      })
    })

    ws.on('message', (data) => {
      let msg: { type?: string; [key: string]: unknown }
      try {
        msg = JSON.parse(data.toString()) as { type?: string; [key: string]: unknown }
      } catch {
        log.error('[Qwen-TTS] invalid JSON from server:', data.toString())
        return
      }

      const type = msg.type

      if (type === 'session.created') {
        sessionCreated = true
        const session = msg.session as { id?: string } | undefined
        log.info('[Qwen-TTS] session.created:', session?.id)
        return
      }

      if (type === 'response.audio.delta') {
        // Server incremental push audio (base64 PCM)
        const b64 = msg.delta as string | undefined
        if (!b64) return
        const buf = Buffer.from(b64, 'base64')
        player.stdin.write(buf)
        return
      }

      if (type === 'response.done') {
        try {
          const SAMPLE_RATE = 16000
          const BYTES_PER_SAMPLE = 2
          const PADDING_MS = 1000

          const paddingSamples = Math.floor((SAMPLE_RATE * PADDING_MS) / 1000)
          const paddingBytes = paddingSamples * BYTES_PER_SAMPLE

          const silence = Buffer.alloc(paddingBytes, 0)
          player.stdin.write(silence)
        } catch (e) {
          log.error('[Qwen-TTS] zero padding error:', e)
        }
        return
      }

      if (type === 'error') {
        log.error('[Qwen-TTS] error:', msg.error)
        return
      }
    })

    ws.on('close', (code, reason) => {
      log.info(`[Qwen-TTS] WS closed: code=${code}, reason=${reason.toString()}`)
      try {
        player.stdin.end()
      } catch {
        log.error('[Qwen-TTS] player error on close')
      }
    })

    ws.on('error', (err) => {
      log.error('[Qwen-TTS] WS error:', err)
      if (!sessionCreated) {
        reject(err)
      }
    })

    function appendText(fragment: string) {
      if (!fragment || !fragment.trim()) return
      if (!ready) {
        log.warn('[Qwen-TTS] not ready yet, skip fragment:', fragment.slice(0, 20))
        return
      }

      send({
        event_id: randomUUID(),
        type: 'input_text_buffer.append',
        text: fragment,
      })
    }

    function commit() {
      if (!ready) return

      send({
        event_id: randomUUID(),
        type: 'input_text_buffer.commit',
      })
    }

    function close() {
      try {
        send({
          event_id: randomUUID(),
          type: 'session.finish',
        })
      } catch {
        // Ignore errors when closing
      }
      ws.close(1000, 'client close')
      try {
        player.stdin.end()
      } catch {
        // Ignore errors when closing player
      }
    }
  })
}
