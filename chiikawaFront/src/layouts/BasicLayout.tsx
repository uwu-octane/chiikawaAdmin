import React, { type ReactNode, useEffect } from 'react'
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom'
import { ProLayout, PageContainer } from '@ant-design/pro-components'
import { UserOutlined } from '@ant-design/icons'
import defaultSettings from '@/config/defaultSettings'
import { AvatarDropdown, Footer, Question, SelectLang } from '@/components'
import { routes } from '@/router/routes'
import type { AppRouteObject } from '@/router/types'
import { useUser } from '@/hooks/useUser'
import { useAuth } from '@/hooks/useAuth'
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
  const { profile, isLoading, hasProfile, fetchUserProfile } = useUser()
  const { logout } = useAuth()

  // 如果还没有用户信息，自动获取
  useEffect(() => {
    if (!hasProfile && !isLoading) {
      fetchUserProfile()
    }
  }, [hasProfile, isLoading, fetchUserProfile])

  // 处理 AvatarDropdown 菜单点击
  const handleMenuSelect = (key: string) => {
    switch (key) {
      case 'center':
        navigate('/profile/basic')
        break
      case 'settings':
        navigate('/profile/settings')
        break
      default:
        break
    }
  }

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await logout()
      navigate('/user/login', { replace: true })
    } catch (error) {
      console.error('Logout error', error)
    }
  }

  // 处理头像 URL：如果为空字符串或只包含空格，返回 undefined
  const avatarUrl = profile?.avatar_url?.trim() || undefined
  const hasAvatar = !!avatarUrl

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
        src: avatarUrl,
        title: profile?.display_name || 'Chiikawa',
        icon: !hasAvatar ? <UserOutlined /> : undefined,
        render: (_, dom) => (
          <AvatarDropdown menu onMenuSelect={handleMenuSelect} onLogout={handleLogout}>
            {dom}
          </AvatarDropdown>
        ),
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
