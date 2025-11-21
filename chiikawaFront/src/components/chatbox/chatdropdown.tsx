'use client'

import React from 'react'
import { Dropdown, type MenuProps } from 'antd'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { Magnetic } from '../motion-primitives/magnetic'

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
            className: 'text-xs text-zinc-500 cursor-default',
          },
        ]
      : safeItems.map((item) => ({
          key: item.id,
          icon: item.icon ? <span className="inline-flex">{item.icon}</span> : null,
          label: <span className="truncate">{item.title}</span>,
          onClick: () => onSelect(item.id),
          className: cn(
            'text-[13px] py-1.5',
            item.id === activeItemId
              ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
              : 'text-zinc-700 dark:text-zinc-200',
            'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
          ),
        }))),
  ]

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomLeft"
      overlayClassName={cn('chatdropdown-overlay', menuClassName)}
      popupRender={(menu) => (
        <div
          className={cn(
            'min-w-[100px] overflow-hidden rounded-lg border border-zinc-100 bg-white p-1 shadow-lg',
            'dark:border-zinc-800 dark:bg-zinc-950',
            menuClassName,
          )}
        >
          <div className="max-h-72 overflow-y-auto">{menu}</div>
        </div>
      )}
    >
      <button
        type="button"
        className={cn(
          'appearance-none bg-transparent border-0 rounded-full',
          'inline-flex items-center justify-center cursor-pointer',
          'transition-all duration-150 ease-in-out',
          'hover:bg-[#f7f7f7] hover:border-black/8 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
          'active:translate-y-[0.5px] active:scale-98',
          'dark:bg-transparent dark:border-white/8 dark:hover:bg-[#111]',
          'px-1 rounded-md text-xs font-semibold',
          buttonClassName,
        )}
        aria-label="选择会话"
      >
        <span className="truncate max-w-[14rem] text-xs px-1.5 text-zinc-800 dark:text-zinc-200">
          {label}
        </span>
        <Magnetic intensity={0.08} range={120} springOptions={{ bounce: 0.12 }}>
          <ChevronDown className="size-3 opacity-70" />
        </Magnetic>
      </button>
    </Dropdown>
  )
}
