import React, { type ReactNode } from 'react'

export type PublicRouteProps = {
  children: ReactNode
}

/**
 * PublicRoute component - for public routes (e.g. login page)
 * empty implementation, directly render children
 */
const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return <>{children}</>
}

export default PublicRoute
