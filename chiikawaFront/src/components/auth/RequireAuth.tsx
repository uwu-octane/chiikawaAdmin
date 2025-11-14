import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '@/hooks/useAuth'

interface RequireAuthProps {
  children: ReactNode
}

/**
 * RequireAuth 组件 - 路由守卫
 * - 检查用户是否已登录
 * - 如果正在验证（checking），显示 Loading
 * - 如果未登录，跳转到登录页并记录来源路径
 * - 如果已登录，渲染子组件
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  // 正在验证身份时显示 Loading
  if (status === 'checking') {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" tip="正在验证身份..." />
      </div>
    )
  }

  // 未登录：跳转到登录页，并记录来源路径
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/user/login"
        replace
        state={{ from: location }} // 登录成功后可以跳回 from
      />
    )
  }

  // 已登录：放行
  return <>{children}</>
}

