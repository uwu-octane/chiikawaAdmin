import * as schema from './migrations/schema'
import * as relations from './migrations/relations'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import config from '@/config/config'

const pool = new Pool({
  connectionString: config.app.databaseUrl,
  schema: { ...schema, ...relations },
})

export const db = drizzle(pool, { schema })
