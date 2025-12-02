import { Logger } from 'tslog'
import config from '@/config/config'

export const baseLogger = new Logger({
  name: 'bun-hono',
  type: config.app.mode === 'DEV' ? 'pretty' : 'json',
  minLevel: 1,
})
export default baseLogger
