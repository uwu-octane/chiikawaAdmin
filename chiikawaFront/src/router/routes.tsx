import { lazy, Suspense } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import type { AppRouteObject } from './types'
import { DashboardOutlined, UserOutlined } from '@ant-design/icons'

import BasicLayout from '@/layouts/BasicLayout'
import UserLayout from '@/layouts/UserLayout'
import BlankLayout from '@/layouts/BlankLayout'
import PageLoading from '@/loading'

// Helper function for lazy loading pages
const lazyLoad = (factory: () => Promise<any>) => {
  const Component = lazy(factory)
  return (
    <Suspense fallback={<PageLoading />}>
      <Component />
    </Suspense>
  )
}

export const routes: AppRouteObject[] = [
  {
    path: '/user',
    element: <UserLayout />,
    name: 'User',
    children: [
      {
        path: 'login',
        name: 'Login',
        element: lazyLoad(() => import('@/pages/user/login')),
      },
    ],
  },
  {
    path: '/',
    element: <BasicLayout />,
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
    ],
  },
  {
    path: '*',
    element: <BlankLayout />,
    children: [{ path: '*', element: lazyLoad(() => import('@/pages/exception/404')) }],
  },
]
