/**
 * Chatbox 模块共享样式常量
 *
 * 按照 Tailwind 样式管理规范：
 * 1. 原子层：只用 utility class
 * 2. 组件层：封装可复用样式模式（本文件）
 * 3. 页面层：主布局结构
 *
 * className 书写顺序：
 * 布局 → 尺寸 → 间距 → 边框/圆角 → 背景/文字 → 特效 → 状态&响应式
 */

import { cn } from '@/lib/utils'

// ===========================
// 按钮样式
// ===========================

/**
 * 圆形图标按钮基础样式
 * 用于：header 图标按钮、dropdown 触发器等
 */
export const iconButtonBase = cn(
  // 布局
  'inline-flex items-center justify-center',
  // 尺寸
  'size-6',
  // 外观
  'appearance-none border-0 rounded-full',
  'bg-transparent',
  // 过渡
  'transition-all duration-150 ease-in-out',
  'cursor-pointer',
  // 交互状态
  'hover:bg-[#f7f7f7] hover:border-black/8 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
  'active:translate-y-[0.5px] active:scale-98',
  // 暗色模式
  'dark:bg-[#0a0a0a] dark:border-white/8 dark:hover:bg-[#111]',
)

/**
 * 图标基础样式
 */
export const iconBase = cn(
  // 尺寸
  'size-3.5',
  // 颜色
  'text-zinc-700',
  // 暗色模式
  'dark:text-gray-200',
)

/**
 * Action Dock 中的芯片按钮样式
 */
export const actionChipBase = cn(
  // 布局
  'flex items-center justify-center',
  // 尺寸
  'aspect-square h-6 w-6',
  // 外观
  'border-none rounded-lg',
  'bg-transparent',
  'shadow-md',
  // 过渡
  'transition-transform duration-200',
  // 交互状态
  'hover:scale-[1] active:scale-95',
)

// ===========================
// Card 容器样式
// ===========================

/**
 * AntD Card 容器样式覆盖
 * 使用 [&_xxx] 语法覆盖 AntD 默认样式
 */
export const cardContainerStyles = {
  wrapper: 'w-full rounded-2xl',

  header: cn(
    '[&_.ant-card-head]:min-h-[10px]',
    '[&_.ant-card-head]:border-b-0',
    '[&_.ant-card-head]:px-2',
    '[&_.ant-card-head]:py-0.5',
  ),

  headerTitle: cn(
    '[&_.ant-card-head-title]:border-b-0',
    '[&_.ant-card-head-title]:p-0',
    '[&_.ant-card-head-title]:leading-5',
  ),

  body: cn(
    '[&_.ant-card-body]:flex',
    '[&_.ant-card-body]:flex-col',
    '[&_.ant-card-body]:px-1',
    '[&_.ant-card-body]:py-0',
  ),
} as const

// ===========================
// 会话/消息样式
// ===========================

/**
 * 会话容器样式
 */
export const conversationStyles = {
  wrapper: cn('flex-1', 'flex flex-col', 'min-h-0', 'max-h-full', 'font-sans'),

  // Conversation 组件容器：提供相对定位上下文给滚动按钮
  container: 'relative w-full h-full scrollbar-hide overflow-y-auto',

  content: cn('min-h-0', '[&_p]:text-[13px] [&_p]:leading-relaxed'),
} as const

/**
 * 消息操作按钮样式
 */
export const messageStyles = {
  // 用户消息操作按钮
  userActions: cn(
    // 显隐控制
    'opacity-0 group-hover:opacity-100',
    'pointer-events-none group-hover:pointer-events-auto',
    // 布局
    'flex flex-row -mr-1',
    // 外观
    'border-0 shadow-none',
    'bg-transparent',
    // 过渡
    'transition-opacity duration-150',
    // 按钮样式
    '[&_button]:rounded-full [&_button]:p-0.5',
    '[&_button]:hover:bg-black/5 [&_button]:hover:shadow-sm',
    // 图标样式
    '[&_svg]:h-3 [&_svg]:w-3 [&_svg]:text-zinc-600',
  ),

  // 助手消息操作按钮
  assistantActions: cn(
    // 布局
    'inline-flex items-center gap-0',
    'self-start',
    'mt-0',
    // 外观
    'appearance-none border-0 rounded-full',
    'bg-transparent',
    // 交互状态
    'active:translate-y-[0.5px] active:scale-98',
    // 暗色模式
    'dark:bg-[#0a0a0a] dark:border-white/8 dark:hover:bg-[#111]',
    // 按钮样式
    '[&_button]:rounded-full [&_button]:p-1',
    // 图标样式
    '[&_svg]:h-3 [&_svg]:w-3',
    '[&_svg]:text-zinc-700',
    'dark:[&_svg]:text-gray-200',
  ),

  // 操作按钮图标 hover 样式
  actionIconHover: cn(
    '[&_button]:hover:bg-[#f7f7f7]',
    '[&_button]:hover:border-black/8',
    '[&_button]:hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
  ),
} as const

// ===========================
// Dropdown 样式
// ===========================

/**
 * 下拉菜单样式
 */
export const dropdownStyles = {
  // 触发按钮
  trigger: cn(
    // 布局
    'inline-flex items-center justify-center',
    // 间距
    'px-1',
    // 外观
    'appearance-none border-0 rounded-md',
    'bg-transparent',
    'text-xs font-semibold',
    // 过渡
    'transition-all duration-150 ease-in-out',
    'cursor-pointer',
    // 交互状态
    'hover:bg-[#f7f7f7] hover:border-black/8 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
    'active:translate-y-[0.5px] active:scale-98',
    // 暗色模式
    'dark:bg-transparent dark:border-white/8 dark:hover:bg-[#111]',
  ),

  // 下拉菜单面板
  panel: cn(
    // 尺寸
    'min-w-[100px]',
    // 间距
    'p-1',
    // 外观
    'overflow-hidden rounded-lg',
    'border border-zinc-100',
    'bg-white',
    'shadow-lg',
    // 暗色模式
    'dark:border-zinc-800 dark:bg-zinc-950',
  ),

  // 菜单项
  item: (isActive: boolean) =>
    cn(
      // 间距
      'py-1.5',
      // 文字
      'text-[13px]',
      // 激活状态
      isActive
        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
        : 'text-zinc-700 dark:text-zinc-200',
      // 交互状态
      'hover:bg-zinc-100 hover:text-zinc-900',
      'dark:hover:bg-zinc-900 dark:hover:text-zinc-100',
    ),
} as const

// ===========================
// 输入框样式
// ===========================

/**
 * 聊天输入框样式
 */
export const inputStyles = {
  // PromptInput 容器
  container: cn(
    'relative',
    'h-10',
    'w-full max-w-full',
    'overflow-hidden',
    'p-0 pr-3',
    'rounded-2xl',
  ),

  // textarea 文本域
  textarea: cn(
    'relative z-10',
    'min-h-[16px] max-h-[200px]',
    'overflow-y-auto',
    'pr-4',
    'text-xs leading-6',
    'placeholder:text-zinc-400',
    'scrollbar-hide',
  ),

  // 发送按钮
  sendButton: cn('h-5 w-5', 'rounded-full', 'bg-black text-white'),
} as const
