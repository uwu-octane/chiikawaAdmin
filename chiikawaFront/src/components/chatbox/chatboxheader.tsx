/**
 * ChatBox Header 组件
 * 提供新建聊天、切换侧边栏、关闭等操作按钮
 */

import { Plus, Sidebar, X } from 'lucide-react'
import { IconButton } from './ui/icon-button'
import { iconBase } from './ui/styles'

export const HeaderExtra = (
  onNewChat: () => void,
  onToggleSidebar: () => void,
  onClose: () => void,
) => {
  return (
    <div className="inline-flex items-center gap-1.5" aria-label="Chat header actions">
      <IconButton
        actionArea="self"
        magneticRange={50}
        icon={<Plus className={iconBase} />}
        label="新建聊天"
        onClick={onNewChat}
      />
      <IconButton
        actionArea="self"
        magneticRange={50}
        icon={<Sidebar className={iconBase} />}
        label="切换侧边栏"
        onClick={onToggleSidebar}
      />
      <IconButton
        actionArea="self"
        magneticRange={50}
        icon={<X className={iconBase} />}
        label="关闭"
        onClick={onClose}
      />
    </div>
  )
}
