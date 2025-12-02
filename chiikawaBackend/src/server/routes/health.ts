import { Hono } from 'hono'

const router = new Hono()

router.get('/health', (c) =>
  c.json({
    ok: true,
    service: process.env.CONSUL_SERVICE_NAME || 'hono-chiikawa-api',
    ts: Date.now(),
    auth: c.req.header('Authorization') ? 'present' : 'absent',
  }),
)

export default router
