import '@/trace/tracing'
import { Context, Next } from 'hono'
import { context as otelContext, trace } from '@opentelemetry/api'
import baseLogger from '@/logger/logger'
import { logs } from '@opentelemetry/api-logs'
import config from '@/config/config'
import { mapTslogLevel } from '@/trace/tracing'
/**
 * Observability middleware that integrates with @hono/otel
 * - Generates requestId
 * - Extracts traceId and spanId from current OpenTelemetry span
 * - Creates context-aware logger with trace correlation
 * - Logs HTTP request/response with trace information
 */
export async function observabilityMiddleware(c: Context, next: Next) {
  const existingReqId = c.req.header('x-request-id')
  const requestId = existingReqId || crypto.randomUUID()
  c.set('X-Request-Id', requestId)
  c.res.headers.set('X-Request-Id', requestId)

  const method = c.req.method
  const path = c.req.path

  // 跳过健康检查端点的日志（避免过多噪音）
  const isHealthCheck = path === '/health' || path.endsWith('/health')

  const userAgent = c.req.header('user-agent') || 'unknown'
  const authorized = c.req.header('Authorization') ? 'present' : 'absent'
  const ip = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'

  // 从当前 OTel context 拿 span
  const span = trace.getSpan(otelContext.active())
  const spanContext = span?.spanContext()
  const traceId = spanContext?.traceId ?? 'unknown'
  const spanId = spanContext?.spanId ?? 'unknown'
  // 自定义属性
  if (span) {
    span.setAttribute('http.request_id', requestId)
    span.setAttribute('http.client_ip', ip)
    span.setAttribute('http.user_agent', userAgent)
    span.setAttribute('http.authorized', authorized)
  }

  // 3) 基于 traceId / spanId / requestId 构造子 logger
  const logger = baseLogger.getSubLogger({
    name: 'http',
  })

  // 让业务 handler 可以 c.get('log') 拿到这个 logger
  c.set('log', logger)

  const start = Date.now()

  // 入站日志（跳过健康检查）
  if (!isHealthCheck) {
    logger.info('→ HTTP request', {
      method,
      path,
      userAgent,
      ip,
      requestId,
      traceId,
      spanId,
      authorized,
    })
  }

  await next()

  const duration = Date.now() - start
  const status = c.res.status

  // 检查是否是流式响应（SSE 或流式内容）
  const contentType = c.res.headers.get('content-type') || ''
  const isStreamingResponse =
    contentType.includes('text/event-stream') ||
    contentType.includes('application/stream+json') ||
    c.res.body instanceof ReadableStream

  // 出站日志（跳过健康检查和流式响应）
  // 流式响应会在流结束时由其他机制记录，这里只记录初始响应
  if (!isHealthCheck && !isStreamingResponse) {
    const logPayload = {
      method,
      path,
      status,
      duration,
      requestId,
      traceId,
      spanId,
      authorized,
    }

    // 根据 HTTP 状态码确定日志级别并记录
    if (status >= 500) {
      logger.error('← HTTP response', logPayload)
    } else if (status >= 400) {
      logger.warn('← HTTP response', logPayload)
    } else {
      logger.info('← HTTP response', logPayload)
    }
  } else if (isStreamingResponse) {
    // 流式响应只记录开始，不记录结束（避免在流进行中关闭连接）
    logger.info('→ HTTP streaming response started', {
      method,
      path,
      status,
      requestId,
      traceId,
      spanId,
    })
  }
  // 发送到 OpenTelemetry
  const otelLogger = logs.getLogger('http')
  otelLogger.emit({
    severityNumber: mapTslogLevel(status),
    body: `← HTTP response: ${method} ${path} ${status} ${duration}ms`,
    attributes: {
      'http.method': method,
      'http.target': path,
      'http.status_code': status,
      'http.request_id': requestId,
      'http.user_agent': userAgent,
      'http.client_ip': ip,
      'http.response_time_ms': duration,
      'service.name': config.consul.serviceName,
      trace_id: traceId,
      span_id: spanId,
    },
  })
  if (span) {
    span.setAttribute('http.server_duration_ms', duration)
  }
}
