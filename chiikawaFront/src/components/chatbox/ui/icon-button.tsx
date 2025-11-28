/**
 * IconButton - 圆形图标按钮组件
 *
 * 用于：header 操作按钮、dropdown 触发器等场景
 * 特性：支持 Magnetic 磁吸效果、可自定义样式
 */

import React from 'react'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { cn } from '@/lib/utils'
import { iconButtonBase } from './styles'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮图标（React 节点） */
  icon: React.ReactNode
  /** 无障碍标签和 title */
  label: string
  /** 是否启用磁吸效果，默认 true */
  withMagnetic?: boolean
  /** 磁吸强度，默认 0.3 */
  magneticIntensity?: number
  /** 磁吸范围，默认 150 */
  magneticRange?: number
  /** 磁吸区域，默认 global */
  actionArea?: 'global' | 'self'
}

/**
 * 圆形图标按钮组件
 *
 * @example
 * ```tsx
 * <IconButton
 *   icon={<Plus className={iconBase} />}
 *   label="新建聊天"
 *   onClick={handleClick}
 * />
 * ```
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      label,
      className,
      actionArea = 'global',
      withMagnetic = true,
      magneticIntensity = 0.3,
      magneticRange = 150,
      ...props
    },
    ref,
  ) => {
    const button = (
      <button
        ref={ref}
        type="button"
        className={cn(iconButtonBase, className)}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </button>
    )

    if (!withMagnetic) {
      return button
    }

    return (
      <Magnetic
        intensity={magneticIntensity}
        range={magneticRange}
        actionArea={actionArea}
        springOptions={{ bounce: 0.1 }}
      >
        {button}
      </Magnetic>
    )
  },
)

IconButton.displayName = 'IconButton'
