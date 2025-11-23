'use client'

import { useState } from 'react'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
  PromptInputAction,
} from '@/components/motion-primitives/prompt-input'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { Button } from '@/components/motion-primitives/customButton'
import { Square, ArrowUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatInputProps = {
  /** 发送消息（点击按钮或按下 Enter 时触发），由父组件实现真正的发送逻辑 */
  onSend: (value: string) => Promise<void>
  /** 当前是否处于“生成中 / 发送中”状态，用来控制 UI */
  isLoading?: boolean
  /** 点击停止按钮时触发（可选） */
  onStop?: () => void
  /** 可选：整体 className，方便外部布局 */
  className?: string
}

/**
 * 只负责输入框 + 按钮交互的 Dumb 组件：
 * - 文本输入本地管理
 * - 发送交给父组件（onSend）
 * - loading/stop 状态由父组件控制（isLoading / onStop）
 */
export function ChatInput({ onSend, isLoading = false, onStop, className }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleChange = (value: string) => {
    setInput(value)
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (isLoading) return

    try {
      await onSend(trimmed)
      setInput('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleButtonClick = () => {
    if (isLoading) {
      onStop?.()
    } else {
      void handleSubmit()
    }
  }

  return (
    <div className={cn('w-full mx-auto', className)}>
      <PromptInput
        value={input}
        onValueChange={handleChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        maxHeight={200}
        className="w-full mx-auto overflow-hidden relative rounded-2xl p-0 pr-3"
      >
        <PromptInputTextarea
          placeholder="Ask me anything..."
          className={cn(
            'relative z-10 min-h-[20px] max-h-[200px] overflow-y-auto pr-4',
            'leading-6 placeholder:text-zinc-400 text-xs',
            'scrollbar-hide',
          )}
        />
        <PromptInputActions className="absolute bottom-1 right-2 p-0 m-0">
          <PromptInputAction tooltip={isLoading ? 'Stop generation' : 'Send message'}>
            <Magnetic intensity={0.4} range={150}>
              <Button
                type="button"
                variant="default"
                size="icon"
                className="h-5 w-5 rounded-full bg-black text-white"
                onClick={handleButtonClick}
              >
                {isLoading ? (
                  <Square className="size-3 fill-current" />
                ) : (
                  <ArrowUp className="size-3" />
                )}
              </Button>
            </Magnetic>
          </PromptInputAction>
        </PromptInputActions>
      </PromptInput>
    </div>
  )
}

export default ChatInput
