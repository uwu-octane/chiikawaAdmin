import { lazy, Suspense, type ComponentType } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { AppRouteObject } from './types'
import { DashboardOutlined, UserOutlined, RobotOutlined, WechatOutlined } from '@ant-design/icons'

import ProtectedLayout from '@/layouts/ProtectedLayout'
import BlankLayout from '@/layouts/BlankLayout'
import PageLoading from '@/loading'

// Helper function for lazy loading pages
const lazyLoad = (factory: () => Promise<{ default: ComponentType }>) => {
  const Component = lazy(factory)
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  )
}

export const routes: AppRouteObject[] = [
  {
    path: '/user/login',
    name: 'Login',
    element: lazyLoad(() => import('@/pages/user/login')),
  },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/analysis" replace />,
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        element: <Outlet />,
        children: [
          {
            path: 'analysis',
            name: 'Analysis',
            icon: <DashboardOutlined />,
            element: lazyLoad(() => import('@/pages/dashboard/analysis')),
          },
        ],
      },
      {
        path: 'profile',
        name: 'Profile',
        icon: <UserOutlined />,
        element: <Outlet />,
        children: [
          {
            path: 'basic',
            name: 'Basic',
            icon: <UserOutlined />,
            element: lazyLoad(() => import('@/pages/profile/basic')),
          },
          {
            // Example of a dynamic route with a parameter
            path: 'details/:id',
            name: 'Details',
            hideInMenu: true, // Usually, you don't want dynamic routes in the menu
            element: lazyLoad(() => import('@/pages/profile/basic')), // Replace with your actual component
          },
        ],
      },
      {
        path: 'agent',
        name: 'Agent',
        icon: <RobotOutlined />,
        element: <Outlet />,
        children: [
          {
            path: 'chat',
            name: 'Chat',
            icon: <WechatOutlined />,
            element: lazyLoad(() => import('@/pages/Agent/chatdemo')),
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <BlankLayout />,
    children: [{ path: '*', element: lazyLoad(() => import('@/pages/exception/404')) }],
  },
]
