import React from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import { antdAppTheme } from '@/theme/antdTheme'
import AppRouter from '@/router'
import GlobalRuntime from '@/global-runtime' // 你自己的逻辑
import { StyleProvider } from 'antd-style'
import { ChatManagerProvider } from '@/contexts/chatContext'
import 'antd/dist/reset.css'
import './globals.css'

export const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={antdAppTheme}>
      {/* 必须有 <AntdApp>，Login 里用了 App.useApp() 才能拿到 message */}
      <AntdApp>
        <GlobalRuntime>
          <StyleProvider>
            {/* ChatManagerProvider 管理多个 Chat 实例 + 消息持久化 */}
            <ChatManagerProvider>
              <AppRouter />
            </ChatManagerProvider>
          </StyleProvider>
        </GlobalRuntime>
      </AntdApp>
    </ConfigProvider>
  )
}
