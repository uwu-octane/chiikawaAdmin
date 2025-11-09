import { App, Button, Space } from 'antd'
import { useEffect, useRef } from 'react'

function waitForController(): Promise<void> {
  if (navigator.serviceWorker.controller) return Promise.resolve()
  return new Promise((resolve) => {
    const onController = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onController)
      resolve()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onController)
  })
}

export default function PWAUpdater() {
  const { notification } = App.useApp()
  const hasShownRef = useRef(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
      if (hasShownRef.current) return
      hasShownRef.current = true
      const key = 'pwa-update'
      notification.open({
        message: 'PWA 更新提示',
        description: '新版本已下载，请刷新页面以应用最新版本',
        duration: 0,
        btn: (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={async () => {
                // 通知 SW 立刻接管
                try {
                  // 发送消息给 waiting worker（新版本）
                  if (registration.waiting) {
                    registration.waiting.postMessage('skipWaiting')
                  } else {
                    // 如果没有 waiting，尝试发送给所有注册的 worker
                    const regs = await navigator.serviceWorker.getRegistrations()
                    await Promise.all(
                      regs.map(async (r) => {
                        if (r.waiting) {
                          r.waiting.postMessage('skipWaiting')
                        }
                      }),
                    )
                  }
                } catch (error) {
                  console.error('Failed to skip waiting:', error)
                }
                // 等待 controller 切换后刷新
                await waitForController()
                window.location.reload()
              }}
            >
              立即更新
            </Button>
            <Button size="small" onClick={() => notification.destroy(key)}>
              稍后
            </Button>
          </Space>
        ),
        key,
      })
    }

    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // 检查是否已有 waiting worker（页面重新加载时可能已存在）
          if (registration.waiting && navigator.serviceWorker.controller) {
            showUpdateNotification(registration)
          }

          // 监听新 worker 的安装
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (!newWorker) return
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification(registration)
              }
            })
          })
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error)
        })
    }
    window.addEventListener('load', onLoad)
    return () => {
      window.removeEventListener('load', onLoad)
    }
  }, [notification])
  return null
}
