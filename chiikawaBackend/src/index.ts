import { Hono } from 'hono'
import api from './server/routes'

const app = new Hono()

app.route('/', api)
export default app
