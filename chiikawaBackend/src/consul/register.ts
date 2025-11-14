import Consul from 'consul';
import { env } from 'bun';

const consulHost = env.CONSUL_HOST || '127.0.0.1';
const consulPort = env.CONSUL_PORT ? Number(env.CONSUL_PORT) : 8500;

const host = env.APP_HOST || '127.0.0.1';
const port = env.APP_PORT ? Number(env.APP_PORT) : 2778;
const serviceName = env.CONSUL_SERVICE_NAME || 'chiikawa';
const serviceId = `${serviceName}-${host}-${port}`;
const consul = new Consul({
  host: consulHost,
  port: consulPort,
});
const svc = {
  id: serviceId,
  name: serviceName,
  address: host,
  port: port,
  tags: ['hono', 'ui', 'http'],
  check: {
    name: `${serviceName} health check`,
    http: `http://host.docker.internal:${port}/chiikawa/health`,
    interval: '10s',
    timeout: '5s',
    deregistercriticalserviceafter: '1m',
  },
};

export async function register() {
  try {
    await consul.agent.service.register(svc);
    console.log(` Registered next-ai to Consul at ${consulHost}:${consulPort} as ${serviceId}`);
  } catch (error) {
    console.error(`Failed to register next-ai to Consul:`, error);
  }
}
