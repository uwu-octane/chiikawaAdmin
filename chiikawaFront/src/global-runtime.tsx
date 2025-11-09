import { App as AntdApp } from 'antd'
import React, { useEffect } from 'react'
import ReactQueryProvider from '@/react-query-provider'
/**
 * GlobalRuntime 相当于原 Umi global.tsx 的“客户端部分”承载层。
 * - 你可以在这里加入：NProgress 路由进度条、消息统一容器、PWA 更新提示等。
 * - 也方便未来注册 window 级别监听或调试开关。
 */
export default function GlobalRuntime({ children }: { children: React.ReactNode }) {
  // 示例：未来可在此放置 PWA 更新提示监听、路由事件等
  useEffect(() => {
    // 预留：比如监听 beforeinstallprompt、service worker 更新等
    // window.addEventListener('beforeinstallprompt', ...)
    return () => {
      // 清理副作用
    }
  }, [])

  // antd v5 推荐在根部包一层 <App>，用于 message、modal 等上下文
  return (
    <AntdApp>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </AntdApp>
  )
}
