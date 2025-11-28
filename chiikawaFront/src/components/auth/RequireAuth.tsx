import React, { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Loading from '@/loading'

export type RequireAuthProps = {
  children: ReactNode
}

/**
 * RequireAuth 组件 - 路由守卫
 * - 检查用户是否已登录
 * - 如果正在验证（checking），显示 Loading
 * - 如果未登录，跳转到登录页并记录来源路径
 * - 如果已登录，渲染子组件
 */
const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { isAuthenticated, status } = useAuth()
  const location = useLocation()

  // if checking authentication, show Loading
  if (status === 'checking') {
    return <Loading />
  }

  // if not authenticated, redirect to login page and record source path
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/user/login"
        replace
        state={{ from: location }} // after login, can redirect back to from
      />
    )
  }

  // if authenticated, allow access
  return <>{children}</>
}

export default RequireAuth
