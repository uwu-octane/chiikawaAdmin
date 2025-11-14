import { Hono } from 'hono'
import health from '../routes/health'

const api = new Hono()

api.route('/api', health)

export default api
