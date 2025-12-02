/**
 * ActionChip - Action Dock 芯片按钮组件
 *
 * 用于：ActionDock 中的快捷操作按钮
 * 特性：支持双层 Magnetic 磁吸效果、可自定义样式
 */

import React from 'react'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { DockItem, DockIcon } from '@/components/motion-primitives/dock'
import { cn } from '@/lib/utils'
import { actionChipBase } from './styles'

export interface ActionChipProps {
  /** 唯一标识 */
  id: string
  /** 显示标题 */
  title: string
  /** 图标（React 节点） */
  icon: React.ReactNode
  /** 点击回调 */
  onClick?: () => void
  /** 链接地址（与 onClick 二选一） */
  href?: string
  /** 自定义样式 */
  className?: string
}

/**
 * Action Dock 芯片按钮组件
 *
 * @example
 * ```tsx
 * <ActionChip
 *   id="home"
 *   title="Home"
 *   icon={<HomeIcon />}
 *   onClick={handleClick}
 * />
 * ```
 */
export function ActionChip({ id, icon, onClick, href, className }: ActionChipProps) {
  const content = (
    <>
      {/* 暂不显示 label，可根据需要启用 */}
      {/* <DockLabel className="text-[10px]">{title}</DockLabel> */}
      <DockIcon className="*:size-4">{icon}</DockIcon>
    </>
  )

  const chip = (
    <Magnetic intensity={0.08} range={120} springOptions={{ bounce: 0.12 }}>
      <Magnetic intensity={0.5} range={90} springOptions={{ bounce: 0.05 }}>
        <DockItem className={cn(actionChipBase, className)}>{content}</DockItem>
      </Magnetic>
    </Magnetic>
  )

  if (href) {
    return (
      <a key={id} href={href} className="inline-flex" onClick={onClick}>
        {chip}
      </a>
    )
  }

  return (
    <button key={id} type="button" className="inline-flex" onClick={onClick}>
      {chip}
    </button>
  )
}
