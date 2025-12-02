import { GridContent } from '@ant-design/pro-components'
import { Menu, ConfigProvider } from 'antd'
import React, { useLayoutEffect, useRef, useState } from 'react'
import BaseView from './components/base'
import BindingView from './components/binding'
import NotificationView from './components/notification'
import SecurityView from './components/security'
import useProfileStyles from './profileStyle'

type SettingsStateKeys = 'base' | 'security' | 'binding' | 'notification'

type SettingsState = {
  mode: 'inline' | 'horizontal'
  selectKey: SettingsStateKeys
}

const Settings: React.FC = () => {
  const { styles } = useProfileStyles()

  const menuMap: Record<SettingsStateKeys, React.ReactNode> = {
    base: '基本设置',
    security: '安全设置',
    binding: '账号绑定',
    notification: '新消息通知',
  }

  const [state, setState] = useState<SettingsState>({
    mode: 'inline',
    selectKey: 'base',
  })

  const dom = useRef<HTMLDivElement | null>(null)

  const resize = () => {
    requestAnimationFrame(() => {
      if (!dom.current) return

      let mode: SettingsState['mode'] = 'inline'
      const { offsetWidth } = dom.current

      if (offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal'
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        mode = 'horizontal'
      }

      setState((prev) => ({
        ...prev,
        mode,
      }))
    })
  }

  useLayoutEffect(() => {
    if (dom.current) {
      window.addEventListener('resize', resize)
      resize()
    }
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [])

  const getMenuItems = () =>
    (Object.keys(menuMap) as SettingsStateKeys[]).map((key) => ({
      key,
      label: menuMap[key],
    }))

  const renderChildren = () => {
    const { selectKey } = state
    switch (selectKey) {
      case 'base':
        return <BaseView />
      case 'security':
        return <SecurityView />
      case 'binding':
        return <BindingView />
      case 'notification':
        return <NotificationView />
      default:
        return null
    }
  }

  return (
    <GridContent className="profile-settings-page">
      <div
        className={styles.main}
        ref={(ref) => {
          if (ref) {
            dom.current = ref
          }
        }}
      >
        {/* 左侧菜单 */}
        <div className={styles.leftMenu}>
          <ConfigProvider prefixCls="settings">
            <Menu
              className="profile-settings-page-menu"
              mode={state.mode}
              selectedKeys={[state.selectKey]}
              onClick={({ key }) => {
                setState((prev) => ({
                  ...prev,
                  selectKey: key as SettingsStateKeys,
                }))
              }}
              items={getMenuItems()}
            />
          </ConfigProvider>
        </div>

        {/* 右侧内容 */}
        <div className={styles.right}>
          <div className={styles.title}>{menuMap[state.selectKey]}</div>
          {renderChildren()}
        </div>
      </div>
    </GridContent>
  )
}

export default Settings
