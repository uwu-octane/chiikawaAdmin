import React, { useEffect } from 'react'
import { App } from 'antd'
import { useSetGlobalConfig } from '@/hooks/useGlobalConfig'

/**
 * GlobalRuntime 相当于原 Umi global.tsx 的"客户端部分"承载层。
 * - 你可以在这里加入：NProgress 路由进度条、消息统一容器、PWA 更新提示等。
 * - 也方便未来注册 window 级别监听或调试开关。
 */
export default function GlobalRuntime({ children }: { children: React.ReactNode }) {
  const { message, modal, notification } = App.useApp()
  const setGlobalConfig = useSetGlobalConfig

  // 初始化全局配置
  useEffect(() => {
    setGlobalConfig({
      message,
      modal: {
        info: modal.info,
        success: modal.success,
        error: modal.error,
        warning: modal.warning,
        confirm: modal.confirm,
      },
      notification,
    })
  }, [message, modal, notification, setGlobalConfig])

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
