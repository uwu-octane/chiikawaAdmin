import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 数据在 30 秒内被认为是新鲜的
            gcTime: 5 * 60 * 1000, // 缓存时间：5 分钟（React Query v5 中的 cacheTime 重命名为 gcTime）
            refetchOnWindowFocus: false, // 窗口聚焦时不重新获取
            retry: 2, // 失败时重试 2 次
          },
        },
      }),
  )
  return (
    <QueryClientProvider client={client}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
