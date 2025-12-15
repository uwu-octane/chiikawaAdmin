import { z } from 'zod'
import { Context, Next } from 'hono'
import type { MiddlewareHandler } from 'hono'

type Target = 'json' | 'form' | 'query' | 'params' | 'header'
type Infer<T extends z.ZodTypeAny> = z.infer<T>

export const zodMiddleware = <TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  target: Target,
): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    let raw: unknown

    try {
      switch (target) {
        case 'json':
          raw = c.req.json()
          break
        case 'form':
          raw = Object.fromEntries((await c.req.formData()).entries())
          break
        case 'query':
          raw = c.req.query()
          break
        case 'params':
          raw = c.req.param()
          break
        case 'header':
          raw = Object.fromEntries(c.req.raw.headers.entries())
          break
      }
    } catch (error) {
      return c.json({ error: 'Invalid request', details: error.message }, 400)
    }

    const result = schema.safeParse(raw)
    if (!result.success) {
      return c.json(
        {
          error: 'ValidationError',
          details: result.error.flatten(),
        },
        400,
      )
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    c.req.addValidatedData(target as any, result.data)

    await next()
  }
}

export type Validated<T extends z.ZodTypeAny> = Infer<T>
