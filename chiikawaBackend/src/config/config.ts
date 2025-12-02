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
    testKey: env.TEST_KEY,
  },
  otel: {
    traceUrl: env.OTEL_TRACE_URL || 'http://localhost:4318/v1/traces',
    logUrl: env.OTEL_LOG_URL || 'http://localhost:4318/v1/logs',
  },
  redis: {
    // Redis 官方 client 只接受 redis:// 或 rediss:// 协议
    url: env.REDIS_URL || 'redis://localhost:6379',
    password: env.REDIS_PASSWORD,
  },
  vercel: {
    gatewayKey: env.VERCEL_AI_GATEWAY,
  },
}
export default config
