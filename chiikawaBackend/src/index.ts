import './trace/tracing'
import { Hono } from 'hono'
import { every } from 'hono/combine'
import { httpInstrumentationMiddleware } from '@hono/otel'
import api from './server/routes'
import config from '@/config/config'
import { register, unregister } from './consul/register'
import baseLogger from './logger/logger'
import { observabilityMiddleware } from './middleware/observability'
import { cors } from 'hono/cors'
type AppEnv = {
  Variables: {
    HTTP_REQUEST_ID: string
    log: ReturnType<typeof baseLogger.getSubLogger>
  }
}

const app = new Hono<AppEnv>()

app.use(
  '*',
  every(
    // 由 @hono/otel 创建 HTTP span（trace）
    httpInstrumentationMiddleware({
      serviceName: config.consul.serviceName,
      serviceVersion: '1.0.0',
    }),
    //  绑定 requestId + logger + traceId/spanId（log）
    observabilityMiddleware,
    cors({
      origin: ['http://localhost:5137'],
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    }),
  ),
)

app.route('/', api)

// 包装 fetch 函数，为流式响应设置更长的超时时间
const wrappedFetch = async (request: Request, server: Bun.Server<unknown>) => {
  // 对于流式响应（chat 和 debug 路由），设置无超时限制
  const url = new URL(request.url)
  if (
    (url.pathname.includes('/chat') || url.pathname.includes('/chat-debug')) &&
    (request.method === 'POST' || request.method === 'GET')
  ) {
    server.timeout(request, 0) // 0 表示无超时限制
  }
  return app.fetch(request)
}

const server = Bun.serve({
  port: config.app.port,
  hostname: config.app.host,
  fetch: wrappedFetch,
  development: config.app.mode === 'DEV',
  // 设置空闲超时时间，最大值为 255 秒
  idleTimeout: config.app.idleTimeout,
})

console.log(`Server is running on ${server.hostname}:${server.port}`)
register()

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  try {
    await Promise.all([
      unregister().catch((err) => {
        console.warn('Error during Consul unregister:', err)
      }),
      // 给 tracing shutdown 一些时间，但它有自己的超时处理
      new Promise((resolve) => setTimeout(resolve, 100)),
    ])
  } catch (error) {
    console.error('Error during shutdown:', error)
  } finally {
    process.exit(0)
  }
})

export default app
