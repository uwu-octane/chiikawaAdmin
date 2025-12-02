import Consul from 'consul'
import config from '@/config/config'

const consulHost = config.consul.host
const consulPort = config.consul.port
const serviceId = config.consul.serviceId
const serviceName = config.consul.serviceName
const consul = new Consul({
  host: consulHost,
  port: consulPort,
})
const svc = {
  id: serviceId,
  name: serviceName,
  address: config.app.consulRegisterHost,
  port: config.app.port,
  tags: ['hono', 'ui', 'http'],
  check: {
    name: `${serviceName} health check`,
    http: `http://${config.app.consulRegisterHost}:${config.app.port}/chiikawa/api/health`,
    interval: '10s',
    timeout: '5s',
    deregistercriticalserviceafter: '1m',
  },
}

export async function register() {
  try {
    await consul.agent.service.register(svc)
    console.log(
      `Registered chiikawa admin to Consul at ${consulHost}:${consulPort} as ${serviceId}`,
    )
  } catch (error) {
    console.error(`Failed to register chiikawa admin to Consul:`, error)
  }
}

export async function unregister() {
  try {
    // 设置超时，避免在 Consul 不可用时无限等待
    const deregisterPromise = consul.agent.service.deregister(serviceId)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Unregister timeout')), 2000),
    )
    await Promise.race([deregisterPromise, timeoutPromise])
    console.log(
      `Unregistered chiikawa admin from Consul at ${consulHost}:${consulPort} as ${serviceId}`,
    )
  } catch (error) {
    // 在开发环境中，如果 Consul 不可用，这是正常的，只记录警告
    const isDev = process.env.MODE === 'DEV' || !process.env.MODE
    if (isDev) {
      console.warn(
        `Consul unregister warning (Consul may be unavailable): ${error instanceof Error ? error.message : error}`,
      )
    } else {
      console.error(`Failed to unregister chiikawa admin from Consul:`, error)
    }
  }
}
