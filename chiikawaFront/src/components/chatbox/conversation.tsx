/**
 * ChatContainer - 聊天容器组件
 * 包含消息列表、操作按钮、滚动控制等功能
 */

'use client'

import * as React from 'react'
import { Card } from 'antd'
import { cn } from '@/lib/utils'
import { HeaderExtra } from './chatboxheader'
import { ChatDropdown } from './chatdropdown'
import type { DropdownItem } from './chatdropdown'
import type { UIMessage } from 'ai'
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { CheckIcon, CopyIcon, PencilIcon, RefreshCcwIcon } from 'lucide-react'
import { cardContainerStyles, conversationStyles, messageStyles } from './ui/styles'

export type ChatMessage = UIMessage

interface ChatContainerProps {
  // 数据
  messages: ChatMessage[]
  copiedMessageId: string | null
  items: DropdownItem[]
  activeItemId: string

  // 回调（从外部传入）
  onNewChat: () => void
  onToggleSidebar: () => void
  onClose: () => void
  onSelect: (id: string) => void
  onRegenerate?: () => void
  onEditUserMessage?: (message: ChatMessage) => void
  onCopy: (text: string, messageId: string) => Promise<void>

  // UI
  children?: React.ReactNode
  height?: number | string
  className?: string
}

export function ChatContainer({
  messages,
  copiedMessageId,
  items,
  activeItemId,
  onNewChat,
  onToggleSidebar,
  onClose,
  onSelect,
  onRegenerate,
  onEditUserMessage,
  onCopy,
  children,
  height = 680,
  className,
}: ChatContainerProps) {
  // 纯展示组件，不包含状态和业务逻辑

  const headerTitle = (
    <ChatDropdown
      items={items}
      activeItemId={activeItemId}
      onSelect={onSelect}
      buttonClassName="h-6"
    />
  )

  const getTextFromMessage = (message: ChatMessage): string => {
    if (!message.parts || message.parts.length === 0) {
      console.warn('Message has no parts:', message)
      return ''
    }
    const textParts = message.parts
      .filter((part) => part.type === 'text')
      .map((part) => (part as { type: 'text'; text: string }).text)

    return textParts.join('\n\n')
  }

  return (
    <Card
      title={
        <div className="inline-block pb-0.5 text-[0.7rem] font-semibold leading-5">
          {headerTitle}
        </div>
      }
      extra={HeaderExtra(onNewChat, onToggleSidebar, onClose)}
      className={cn(
        cardContainerStyles.wrapper,
        cardContainerStyles.header,
        cardContainerStyles.headerTitle,
        cardContainerStyles.body,
        className,
      )}
      styles={{
        body: {
          minHeight: '480px',
          maxHeight: typeof height === 'number' ? `${height}px` : height,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* 会话主体 - 使用 Vercel AI SDK 的 Message 组件 */}
      <div className={conversationStyles.wrapper}>
        <Conversation className={conversationStyles.container}>
          <ConversationContent className={conversationStyles.content}>
            {messages.map((message, messageIndex) => {
              const text = getTextFromMessage(message)
              const isLastMessage = messageIndex === messages.length - 1
              const isUserMessage = message.role === 'user'
              const isAssistantMessage = message.role === 'assistant'
              return (
                <React.Fragment key={message.id}>
                  <Message from={message.role} className={cn('group')}>
                    {isUserMessage && (
                      <MessageActions className={messageStyles.userActions}>
                        {/* Copy 按钮 */}
                        <MessageAction
                          onClick={() => {
                            void onCopy(text, message.id)
                          }}
                          label={copiedMessageId === message.id ? 'Copied' : 'Copy'}
                        >
                          {copiedMessageId === message.id ? <CheckIcon /> : <CopyIcon />}
                        </MessageAction>

                        {/* Edit 按钮：调用外层回调 */}
                        <MessageAction onClick={() => onEditUserMessage?.(message)} label="Edit">
                          <PencilIcon />
                        </MessageAction>
                      </MessageActions>
                    )}

                    <MessageContent>
                      <MessageResponse>{text}</MessageResponse>
                    </MessageContent>

                    {/* 显示操作按钮 - 仅对最后一条 assistant 消息 */}
                    {isAssistantMessage && isLastMessage && (
                      <MessageActions className={messageStyles.assistantActions}>
                        {onRegenerate && (
                          <MessageAction
                            onClick={() => onRegenerate()}
                            label="Retry"
                            //tooltip="Regenerate response"
                          >
                            <RefreshCcwIcon className={messageStyles.actionIconHover} />
                          </MessageAction>
                        )}
                        <MessageAction
                          onClick={() => {
                            void onCopy(text, message.id)
                          }}
                          label={copiedMessageId === message.id ? 'Copied' : 'Copy'}
                          //tooltip="Copy to clipboard"
                        >
                          {copiedMessageId === message.id ? (
                            <CheckIcon className={messageStyles.actionIconHover} />
                          ) : (
                            <CopyIcon className={messageStyles.actionIconHover} />
                          )}
                        </MessageAction>
                      </MessageActions>
                    )}
                  </Message>
                </React.Fragment>
              )
            })}
          </ConversationContent>
        </Conversation>
      </div>

      {/* 底部输入区（来自外部） */}
      <div className="border-0 py-1">{children}</div>
    </Card>
  )
}
