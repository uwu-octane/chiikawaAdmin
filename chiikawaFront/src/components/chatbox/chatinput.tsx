/**
 * ChatInput - 聊天输入框组件
 *
 * 只负责输入框 + 按钮交互的 Dumb 组件：
 * - 文本输入本地管理
 * - 发送交给父组件（onSend）
 * - loading/stop 状态由父组件控制（isLoading / onStop）
 */

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
import { inputStyles } from './ui/styles'

type ChatInputProps = {
  /** 发送消息（点击按钮或按下 Enter 时触发），由父组件实现真正的发送逻辑 */
  onSend: (value: string) => Promise<void>
  /** 当前是否处于"生成中 / 发送中"状态，用来控制 UI */
  isLoading?: boolean
  /** 点击停止按钮时触发（可选） */
  onStop?: () => void
  /** 可选：整体 className，方便外部布局 */
  className?: string
}

export function ChatInput({ onSend, isLoading = false, onStop, className }: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleChange = (value: string) => {
    setInput(value)
  }

  const handleSubmit = async () => {
    const trimmed = input.trim()
    if (!trimmed) return
    if (isLoading) return

    // 立即清空输入框，不等待发送完成
    setInput('')

    try {
      await onSend(trimmed)
    } catch (error) {
      console.error(error)
      // 发送失败时，可以选择恢复输入内容
      setInput(trimmed)
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
    <div className={cn('mx-auto w-full', className)}>
      <PromptInput
        value={input}
        onValueChange={handleChange}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        maxHeight={200}
        className={inputStyles.container}
      >
        <PromptInputTextarea placeholder="Ask me anything..." className={inputStyles.textarea} />
        <PromptInputActions className="absolute bottom-1 right-2 m-0 p-0">
          <PromptInputAction tooltip={isLoading ? 'Stop generation' : 'Send message'}>
            <Magnetic intensity={0.4} range={150}>
              <Button
                type="button"
                variant="default"
                size="icon"
                className={inputStyles.sendButton}
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
