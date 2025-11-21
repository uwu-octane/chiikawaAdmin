'use client'

import * as React from 'react'
import { Card, Avatar } from 'antd'
import { Conversations, Bubble } from '@ant-design/x'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { HeaderExtra } from './chatboxheader'
import { ChatDropdown } from './chatdropdown'
import type { DropdownItem } from './chatdropdown'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  avatar?: string
  name?: string
  plugins?: Array<{ type: string; payload: unknown }>
}

interface ChatContainerProps {
  messages: ChatMessage[]
  children?: React.ReactNode
  height?: number | string
  className?: string
  onNewChat: () => void
  onToggleSidebar: () => void
  onClose: () => void
  items: DropdownItem[]
  activeItemId: string
  onSelect: (id: string) => void
}

function MarkdownRender({ text }: { text: string }) {
  return <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>{text}</ReactMarkdown>
}

export function ChatContainer({
  messages,
  children,
  height = 520,
  className,
  onNewChat,
  onToggleSidebar,
  onClose,
  items,
  activeItemId,
  onSelect,
}: ChatContainerProps) {
  const headerTitle = (
    <ChatDropdown
      items={items}
      activeItemId={activeItemId}
      onSelect={onSelect}
      buttonClassName="h-6"
    />
  )

  // 将消息转换为 Ant Design X Conversations 需要的格式
  const conversationItems = messages.map((m) => {
    const bubbleContent = (
      <div className="[&_code]:font-mono [&_code]:text-[0.8125rem] [&_p]:my-1">
        <MarkdownRender text={m.content} />
        {/* 预留插件渲染位 */}
        {m.plugins?.map((p, i) => (
          <div key={i}>插件：{p.type}</div>
        ))}
      </div>
    )

    return {
      key: m.id,
      placement: m.role === 'user' ? ('end' as const) : ('start' as const),
      avatar: m.avatar ? (
        <Avatar src={m.avatar} size={32}>
          {m.name?.[0] || m.role[0].toUpperCase()}
        </Avatar>
      ) : undefined,
      children: (
        <Bubble
          content={bubbleContent}
          variant={m.role === 'user' ? 'shadow' : 'borderless'}
          styles={{
            content: {
              backgroundColor: m.role === 'user' ? '#1677ff' : '#f5f5f5',
              color: m.role === 'user' ? '#fff' : '#000',
            },
          }}
        />
      ),
    }
  })

  return (
    <Card
      title={
        <div className="inline-block text-[0.7rem] font-semibold leading-5 pb-0.5">
          {headerTitle}
        </div>
      }
      extra={HeaderExtra(onNewChat, onToggleSidebar, onClose)}
      className={cn(
        'rounded-2xl overflow-hidden w-full',
        '[&_.ant-card-head]:min-h-[28px] [&_.ant-card-head]:px-3 [&_.ant-card-head]:py-1.5 [&_.ant-card-head]:border-b-0',
        '[&_.ant-card-head-title]:border-b-0 [&_.ant-card-head-title]:leading-5 [&_.ant-card-head-title]:p-0',
        '[&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:p-1',
        className,
      )}
      style={
        {
          '--chatbox-body-height': typeof height === 'number' ? `${height}px` : height,
        } as React.CSSProperties
      }
      styles={{
        body: {
          height: typeof height === 'number' ? `${height}px` : height,
        },
      }}
    >
      {/* 会话主体 - 使用 Ant Design X 的 Conversations 组件 */}
      <div className="flex-1 overflow-hidden flex flex-col text-[0.6rem] leading-6 font-sans">
        <div className="flex-1 px-4 py-3 overflow-y-auto [&>*+*]:mt-4">
          <Conversations items={conversationItems} />
        </div>
      </div>

      {/* 底部输入区（来自外部） */}
      <div className="border-0 p-0">{children}</div>
    </Card>
  )
}
