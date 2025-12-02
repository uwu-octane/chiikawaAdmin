// src/lib/request/client.ts
import ky, { type Options as KyOptions } from 'ky'

export type ApiResponse<Data> = {
  code: number
  msg: string
  data: Data
}

export type ErrorType<ErrorData> = ErrorData
export type BodyType<BodyData> = BodyData
const apiBase = import.meta.env.VITE_API_BASE_URL || ''

const http = ky.create({
  ...(apiBase && { prefixUrl: apiBase }),
  timeout: 10000, // 10秒超时
  credentials: 'include',
  hooks: {
    beforeRequest: [
      (request) => {
        // 从 localStorage 读取 token
        const token = localStorage.getItem('access_token')
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
  },
})

export const orvalKy = async <Result>(
  url: string,
  options?: RequestInit & {
    method?: KyOptions['method']
    headers?: Record<string, string> | HeadersInit
    body?: unknown
    signal?: AbortSignal
  },
): Promise<Result> => {
  // 确保 url 是有效的字符串
  if (!url || typeof url !== 'string') {
    throw new Error(`Invalid URL: ${url}`)
  }

  const { method, headers, body, signal, ...restOptions } = options || {}

  const normalizedUrl = apiBase ? (url.startsWith('/') ? url.slice(1) : url) : url

  // 构建 ky 请求配置
  const requestOptions: KyOptions = {
    method,
    signal,
    ...restOptions,
  }

  // 处理 headers：将 Headers 对象转换为普通对象
  if (headers) {
    if (headers instanceof Headers) {
      const headersObj: Record<string, string> = {}
      headers.forEach((value, key) => {
        headersObj[key] = value
      })
      requestOptions.headers = headersObj
    } else if (typeof headers === 'object' && headers !== null && !Array.isArray(headers)) {
      requestOptions.headers = headers as Record<string, string>
    }
  }

  // 处理 body：如果是字符串（已 JSON.stringify），使用 body；如果是对象，使用 json
  if (body !== undefined && body !== null) {
    if (typeof body === 'string') {
      requestOptions.body = body
    } else {
      requestOptions.json = body
    }
  }

  try {
    const res = await http(normalizedUrl, requestOptions)

    // 后端返回 {code,msg,data} 格式
    // 我们需要提取 data 类型，并构造 orval 期望的格式 { data, status: 200, headers }
    type ResultData = Result extends { data: infer D } ? D : never
    const json = await res.json<ApiResponse<ResultData>>()
    // 检查业务状态码（如果后端使用非 200 的 code 表示错误）
    if (json.code !== 200) {
      const errorMsg = json.msg || `Request failed with code ${json.code}`
      const error = new Error(errorMsg)
      // 添加额外的错误信息
      ;(error as Error & { code?: number; url?: string }).code = json.code
      ;(error as Error & { code?: number; url?: string }).url = normalizedUrl
      throw error
    }

    // 构造 orval 期望的响应格式，同时包含 code 和 msg
    return {
      data: json.data,
      status: 200,
      headers: res.headers,
      code: json.code,
      msg: json.msg,
    } as Result
  } catch (error) {
    // 如果是我们抛出的错误，直接重新抛出
    if (error instanceof Error) {
      // 如果是 ky 的 HTTPError，尝试提取更多信息
      if ('response' in error && error.response) {
        const httpError = error as Error & {
          response?: { status?: number; statusText?: string; url?: string }
        }
        const enhancedError = new Error(
          `${error.message} (HTTP ${httpError.response?.status || 'unknown'})`,
        )
        ;(enhancedError as Error & { status?: number; url?: string }).status =
          httpError.response?.status
        ;(enhancedError as Error & { status?: number; url?: string }).url =
          httpError.response?.url || normalizedUrl
        throw enhancedError
      }
      throw error
    }

    // 其他错误（网络错误等）
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}
