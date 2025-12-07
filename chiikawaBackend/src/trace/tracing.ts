import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import config from '@/config/config'
import { SeverityNumber } from '@opentelemetry/api-logs'

// 创建共享的 resource
const resource = defaultResource().merge(
  resourceFromAttributes({
    [ATTR_SERVICE_NAME]: config.consul.serviceName,
    [ATTR_SERVICE_VERSION]: '1.0.0',
  }),
)

// Trace Exporter
const traceExporter = new OTLPTraceExporter({
  url: config.otel.traceUrl,
})

// Log Exporter
const logExporter = new OTLPLogExporter({
  url: config.otel.logUrl,
})

const sdk = new NodeSDK({
  resource,
  traceExporter,
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  //   instrumentations: [new HttpInstrumentation()],
})

try {
  sdk.start()
  console.log('OpenTelemetry initialized (traces + logs)')
} catch (error) {
  console.error('Error initializing OpenTelemetry:', error)
}

async function shutdown() {
  try {
    // 设置超时，避免在收集器不可用时无限等待
    const shutdownPromise = sdk.shutdown()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Shutdown timeout')), 2000),
    )
    await Promise.race([shutdownPromise, timeoutPromise])
    console.log('Tracing shutdown')
  } catch (error) {
    // 在开发环境中，如果收集器不可用，这是正常的，只记录警告
    if (config.app.mode === 'DEV') {
      console.warn('Tracing shutdown warning (collector may be unavailable):', error)
    } else {
      console.error('Error shutting down tracing:', error)
    }
  } finally {
    process.exit(0)
  }
}

export function mapTslogLevel(level: number): SeverityNumber {
  // tslog 的 level: 0= silly, 1= trace, 2= debug, 3= info, 4= warn, 5= error, 6= fatal
  if (level >= 5) return SeverityNumber.ERROR
  if (level === 4) return SeverityNumber.WARN
  if (level === 3) return SeverityNumber.INFO
  return SeverityNumber.DEBUG
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
