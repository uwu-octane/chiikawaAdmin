/**
 * ChatDropdown - 会话下拉选择器
 * 用于选择历史会话或创建新会话
 */

'use client'

import React from 'react'
import { Dropdown, type MenuProps } from 'antd'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Magnetic } from '../motion-primitives/magnetic'
import { dropdownStyles } from './ui/styles'

export type DropdownItem = {
  id: string
  title: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}

type Props = {
  items: DropdownItem[]
  activeItemId?: string
  onSelect: (id: string) => void
  className?: string
  buttonClassName?: string
  menuClassName?: string
}

export function ChatDropdown({
  items,
  activeItemId,
  onSelect,
  buttonClassName,
  menuClassName,
}: Props) {
  const safeItems = items ?? []
  const active = safeItems.find((item) => item.id === activeItemId)
  const label = active?.title ?? safeItems[0]?.title ?? 'New Chat'

  // 构建 Ant Design 的 menu items
  const menuItems: MenuProps['items'] = [
    {
      type: 'divider',
      className: 'my-1 bg-zinc-200 dark:bg-zinc-800',
    },
    ...(safeItems.length === 0
      ? [
          {
            key: 'empty',
            label: '暂无历史会话',
            disabled: true,
            className: 'cursor-default text-xs text-zinc-500',
          },
        ]
      : safeItems.map((item) => ({
          key: item.id,
          icon: item.icon ? <span className="inline-flex">{item.icon}</span> : null,
          label: <span className="truncate">{item.title}</span>,
          onClick: () => onSelect(item.id),
          className: dropdownStyles.item(item.id === activeItemId),
        }))),
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
      overlayClassName={cn('chatdropdown-overlay', menuClassName)}
      popupRender={(menu) => (
        <div className={cn(dropdownStyles.panel, menuClassName)}>
          <div className="max-h-72 overflow-y-auto">{menu}</div>
        </div>
      )}
    >
      <button
        type="button"
        className={cn(dropdownStyles.trigger, buttonClassName)}
        aria-label="选择会话"
      >
        <span className="max-w-[14rem] truncate px-1.5 text-xs text-zinc-800 dark:text-zinc-200">
          {label}
        </span>
        <Magnetic intensity={0.08} range={120} springOptions={{ bounce: 0.12 }}>
          <ChevronDown className="size-3 opacity-70" />
        </Magnetic>
      </button>
    </Dropdown>
  )
}
