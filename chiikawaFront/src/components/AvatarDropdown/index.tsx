import React, { useCallback } from 'react'
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import { createStyles } from 'antd-style'
import classNames from 'classnames'

export type AvatarDropdownProps = {
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
    dropdown: {
      [`@media screen and (max-width: ${token.screenXS}px)`]: {
        width: '100%',
      },
    },
  }
})

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
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
            label: 'Profile',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Settings',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ]

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      overlayClassName={classNames(styles.dropdown)}
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      <span className={styles.action}>{children}</span>
    </Dropdown>
  )
}
