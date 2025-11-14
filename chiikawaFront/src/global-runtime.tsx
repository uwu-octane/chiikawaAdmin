import React, { useEffect } from 'react'
/**
 * GlobalRuntime 相当于原 Umi global.tsx 的"客户端部分"承载层。
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

  // 注意：AntdApp 和 ReactQueryProvider 已移到 App.tsx 统一管理
  return <>{children}</>
}
