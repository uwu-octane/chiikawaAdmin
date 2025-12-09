import { env } from 'bun'

const serviceName = env.CONSUL_SERVICE_NAME || 'chiikawa-admin'
const appHost = env.APP_HOST || '127.0.0.1'
const appPort = env.APP_PORT ? Number(env.APP_PORT) : 2778
const consulRegisterHost = env.CONSUL_SERVICE_ADDRESS

export const config = {
  consul: {
    host: env.CONSUL_HOST || '127.0.0.1',
    port: env.CONSUL_PORT ? Number(env.CONSUL_PORT) : 8500,
    serviceId: `${serviceName}-${consulRegisterHost}-${appPort}`,
    serviceName: serviceName,
  },
  app: {
    port: appPort,
    host: appHost,
    consulRegisterHost: consulRegisterHost,
    apiBase: env.API_BASE || '/chiikawa/api',
    mode: env.MODE || 'DEV',
    // HTTP 请求空闲超时时间（秒），最大 255 秒，默认 255 秒
    // 注意：Bun.serve 的 idleTimeout 最大值为 255 秒
    idleTimeout: env.APP_IDLE_TIMEOUT ? Math.min(255, Number(env.APP_IDLE_TIMEOUT)) : 255,
  },
  otel: {
    traceUrl: env.OTEL_TRACE_URL || 'http://localhost:4318/v1/traces',
    logUrl: env.OTEL_LOG_URL || 'http://localhost:4318/v1/logs',
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318',
  },
  redis: {
    // Redis 官方 client 只接受 redis:// 或 rediss:// 协议
    url: env.REDIS_URL || 'redis://localhost:6379',
    password: env.REDIS_PASSWORD,
  },
  vercel: {
    gatewayKey: env.VERCEL_AI_GATEWAY,
  },
  qwen: {
    wsUrl: env.QWEN_REALTIME_BASE_URL,
    apiKey: env.QWEN_KEY,
    asrModel: env.QWEN_ASR_MODEL,
    ttsModel: env.QWEN_TTS_MODEL,
    embeddingModel: env.QWEN_EMBEDDING_MODEL,
    embedDimensions: env.QWEN_EMBEDDING_DIMENSIONS,
    embeddingBaseUrl: env.QWEN_EMBEDDING_BASE_URL,
  },
}
export default config
