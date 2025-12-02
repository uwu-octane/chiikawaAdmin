import { createClient, type RedisClientType } from 'redis'
import config from '@/config/config'

export type RedisClient = RedisClientType

let client: RedisClient | null = null

export async function getRedisClient(): Promise<RedisClient> {
  if (client && client.isOpen) return client

  client = createClient({
    url: config.redis.url,
    password: config.redis.password,
  })

  client.on('error', (err) => {
    console.error('[Redis] Client Error', err)
  })

  if (!client.isOpen) {
    await client.connect()
  }

  return client
}
