import { Hono } from 'hono'
import health from '@/server/routes/health'
import chat from '@/server/routes/chat.route'
import debug from '@/server/routes/debug'
import config from '@/config/config'

const api = new Hono()
const apiBase = config.app.apiBase
api.route(apiBase, health)
api.route(apiBase, chat)
api.route(apiBase, debug)

export default api
