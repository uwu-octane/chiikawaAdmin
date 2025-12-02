/**
 * ActionDock - 快捷操作栏组件
 * 提供一组快捷操作按钮，支持磁吸效果和放大动画
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Dock } from '@/components/motion-primitives/dock'
import { ActionChip } from './ui/action-chip'

export type ActionItem = {
  id: string
  title: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}

type Props = {
  actions: ActionItem[]
  className?: string
}

export function ActionDock({ actions, className }: Props) {
  return (
    <div
      className={cn(
        // 布局
        'flex items-end',
        // 尺寸
        'w-full max-h-[40px]',
        // 间距
        'mx-auto',
        // 交互
        'pointer-events-auto',
        className,
      )}
      aria-label="AI action dock"
    >
      <div className="relative flex w-full justify-center">
        <Dock
          magnification={40}
          panelHeight={40}
          distance={0}
          className="overflow-visible gap-1 border-0 bg-transparent px-1 shadow-none dark:bg-transparent"
        >
          {actions.map((item) => (
            <ActionChip
              key={item.id}
              id={item.id}
              title={item.title}
              icon={item.icon}
              onClick={item.onClick}
              href={item.href}
              className={'h-full w-full shadow-none text-neutral-600 dark:text-neutral-300'}
            />
          ))}
        </Dock>
      </div>
    </div>
  )
}
