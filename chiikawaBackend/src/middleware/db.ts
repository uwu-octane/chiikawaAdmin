import { Context, Next } from 'hono'
import type { MiddlewareHandler } from 'hono'
import { db } from '@/db'

export const dbMiddleware: MiddlewareHandler = async (c: Context, next: Next) => {
  c.set('db', db)
  await next()
}
