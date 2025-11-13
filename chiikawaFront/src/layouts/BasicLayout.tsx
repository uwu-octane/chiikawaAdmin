import React, { type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { ProLayout, PageContainer } from '@ant-design/pro-components'
import { UserOutlined } from '@ant-design/icons'

import defaultSettings from '@/config/defaultSettings'
import { AvatarDropdown, Footer, Question, SelectLang } from '@/components'
import { routes } from '@/router/routes'
import type { AppRouteObject } from '@/router/types'

interface MenuItem {
  path: string
  name?: ReactNode
  icon?: ReactNode
  children?: MenuItem[]
}

const menuDataRender = (routes: AppRouteObject[], parentPath = ''): MenuItem[] => {
  return routes
    .filter((route) => route.name && !route.hideInMenu)
    .map((route) => {
      const { path: currentPath, name, children, icon, index } = route
      const path = index ? parentPath : `${parentPath}/${currentPath}`.replace(/\/+/g, '/')

      return {
        path,
        name,
        icon,
        children: children ? menuDataRender(children, path) : undefined,
      }
    })
}

const BasicLayout: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const mainLayoutRoutes = routes.find((r) => r.path === '/')?.children || []

  return (
    <ProLayout
      {...defaultSettings}
      route={{
        path: '/',
        routes: menuDataRender(mainLayoutRoutes),
      }}
      location={{ pathname: location.pathname }}
      onMenuHeaderClick={() => navigate('/')}
      menuItemRender={(item, dom) => {
        if (!item.path) {
          return dom
        }
        return <Link to={item.path}>{dom}</Link>
      }}
      actionsRender={() => [<Question key="question" />, <SelectLang key="lang" />]}
      avatarProps={{
        size: 'small',
        title: 'Chiikawa',
        icon: <UserOutlined />,
        render: (_, dom) => <AvatarDropdown menu>{dom}</AvatarDropdown>,
      }}
      footerRender={() => <Footer />}
      breadcrumbRender={(routers = []) => [...routers]}
      itemRender={(route, _, routes) => {
        const last = routes.indexOf(route) === routes.length - 1
        const label = route.title
        return last ? <span>{label}</span> : <Link to={route.path || '/'}>{label}</Link>
      }}
    >
      <PageContainer>
        <Outlet />
      </PageContainer>
    </ProLayout>
  )
}

export default BasicLayout
