import React, { useCallback } from 'react'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { createStyles } from 'antd-style'

import HeaderDropdown from '../HeaderDropdown'

export type GlobalHeaderRightProps = {
  menu?: boolean
  children?: React.ReactNode
  onMenuSelect?: (key: string) => void
  onLogout?: () => void
}

export const AvatarName: React.FC<{ name?: string }> = ({ name }) => {
  if (!name) {
    return <span className="anticon">Chiikawa</span>
  }
  return <span className="anticon">{name}</span>
}

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      gap: '8px',
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  }
})

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  menu,
  children,
  onMenuSelect,
  onLogout,
}) => {
  const { styles } = useStyles()

  const onMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (key === 'logout') {
        onLogout?.()
        return
      }
      onMenuSelect?.(String(key))
    },
    [onLogout, onMenuSelect],
  )

  const menuItems: MenuProps['items'] = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ]

  return (
    <HeaderDropdown
      placement="bottomRight"
      trigger={['click']}
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      <span className={styles.action}>{children}</span>
    </HeaderDropdown>
  )
}
