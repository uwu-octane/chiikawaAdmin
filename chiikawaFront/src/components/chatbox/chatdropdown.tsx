/**
 * ChatDropdown - 会话下拉选择器
 * 用于选择历史会话或创建新会话
 */

'use client'

import React from 'react'
import { Dropdown, type MenuProps } from 'antd'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'
import { Magnetic } from '../motion-primitives/magnetic'
import { dropdownStyles } from './ui/styles'

export type DropdownItem = {
  id: string
  title: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
  /** 会话的更新时间（用于分组） */
  updatedAt?: number
}

type Props = {
  items: DropdownItem[]
  activeItemId?: string
  onSelect: (id: string) => void
  className?: string
  buttonClassName?: string
  menuClassName?: string
}

/**
 * 按时间分组会话
 */
function groupItemsByTime(items: DropdownItem[]) {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const sevenDays = 7 * oneDay
  const thirtyDays = 30 * oneDay

  const groups = {
    today: [] as DropdownItem[],
    last7Days: [] as DropdownItem[],
    last30Days: [] as DropdownItem[],
    older: [] as DropdownItem[],
  }

  items.forEach((item) => {
    const updatedAt = item.updatedAt || 0
    const diff = now - updatedAt

    if (diff < oneDay) {
      groups.today.push(item)
    } else if (diff < sevenDays) {
      groups.last7Days.push(item)
    } else if (diff < thirtyDays) {
      groups.last30Days.push(item)
    } else {
      groups.older.push(item)
    }
  })

  return groups
}

export function ChatDropdown({
  items,
  activeItemId,
  onSelect,
  buttonClassName,
  menuClassName,
}: Props) {
  const safeItems = React.useMemo(() => items ?? [], [items])
  const active = safeItems.find((item) => item.id === activeItemId)
  const label = active?.title ?? safeItems[0]?.title ?? 'New Chat'

  // 按时间分组
  const groups = React.useMemo(() => groupItemsByTime(safeItems), [safeItems])

  // 构建分组菜单项
  const buildGroupItems = React.useCallback(
    (groupItems: DropdownItem[], groupLabel: string) => {
      if (groupItems.length === 0) return []

      return [
        // 分组标题
        {
          key: `group-${groupLabel}`,
          label: (
            <div className="px-2 py-1 text-[0.7rem] font-medium text-zinc-500 dark:text-zinc-400">
              {groupLabel}
            </div>
          ),
          disabled: true,
          className: 'cursor-default hover:bg-transparent',
        },
        // 分组内的会话项
        ...groupItems.map((item) => ({
          key: item.id,
          icon: item.icon ? <span className="inline-flex">{item.icon}</span> : null,
          label: (
            <div className="flex items-center justify-between w-full gap-2">
              <span className="truncate flex-1">{item.title}</span>
              {item.id === activeItemId && (
                <Check className="size-3.5 text-zinc-700 dark:text-zinc-300 flex-shrink-0" />
              )}
            </div>
          ),
          onClick: () => onSelect(item.id),
          className: dropdownStyles.item(item.id === activeItemId),
        })),
      ]
    },
    [activeItemId, onSelect],
  )

  // 构建 Ant Design 的 menu items
  const menuItems: MenuProps['items'] =
    safeItems.length === 0
      ? [
          {
            key: 'empty',
            label: '暂无历史会话',
            disabled: true,
            className: 'cursor-default text-xs text-zinc-500',
          },
        ]
      : [
          ...buildGroupItems(groups.today, '今天'),
          ...buildGroupItems(groups.last7Days, '过去 7 天'),
          ...buildGroupItems(groups.last30Days, '过去 30 天'),
          ...buildGroupItems(groups.older, '更早'),
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
