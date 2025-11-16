import React, { type ReactNode } from 'react'

export type PublicRouteProps = {
  children: ReactNode
}

/**
 * PublicRoute 组件 - 用于公开路由（如登录页）
 * 空实现，直接渲染子组件
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return <>{children}</>
}

export default PublicRoute

