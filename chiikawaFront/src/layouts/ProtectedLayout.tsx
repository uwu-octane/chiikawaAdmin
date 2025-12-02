import React from 'react'
import RequireAuth from '@/components/auth/RequireAuth'
import BasicLayout from './BasicLayout'

/**
 * ProtectedLayout 组件 - 受保护的布局
 * 用于批量保护需要登录才能访问的路由
 * 内部使用 RequireAuth 包裹 BasicLayout，这样整个布局下的所有路由都需要登录
 */
const ProtectedLayout: React.FC = () => {
  return (
    <RequireAuth>
      <BasicLayout />
    </RequireAuth>
  )
}

export default ProtectedLayout
