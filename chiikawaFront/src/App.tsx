import React from 'react'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import '@unocss/reset/tailwind.css'
import './globals.css'
import { antdAppTheme } from '@/theme/antdTheme'
import AppRouter from '@/router'
import GlobalRuntime from '@/global-runtime' // 你自己的逻辑
import ReactQueryProvider from '@/react-query-provider'

export const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN} theme={antdAppTheme}>
      <ReactQueryProvider>
        <GlobalRuntime>
          <AppRouter />
        </GlobalRuntime>
      </ReactQueryProvider>
    </ConfigProvider>
  )
}
