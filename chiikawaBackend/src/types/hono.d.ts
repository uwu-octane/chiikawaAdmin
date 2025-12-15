import type { db } from '@/db'

declare module 'hono' {
  interface ContextVariableMap {
    db: typeof db
  }
}
