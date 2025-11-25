'use client'

import * as React from 'react'
import { Card, Avatar } from 'antd'
import { Bubble } from '@ant-design/x'
import { XMarkdown } from '@ant-design/x-markdown'
// import ReactMarkdown from 'react-markdown'
// import rehypeRaw from 'rehype-raw'
// import rehypeHighlight from 'rehype-highlight'
import { cn } from '@/lib/utils'
import { HeaderExtra } from './chatboxheader'
import { ChatDropdown } from './chatdropdown'
import type { DropdownItem } from './chatdropdown'
import type { UIMessage } from 'ai'
export type ChatMessage = UIMessage

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
  //return <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>{text}</ReactMarkdown>
  return <XMarkdown>{text}</XMarkdown>
}

const testText = `
Here's a Python code block example that demonstrates how to calculate Fibonacci numbers:

\`\`\` python
def fibonacci(n):
    """
    Calculate the nth Fibonacci number
    :param n: The position in the Fibonacci sequence (must be a positive integer)
    :return: The value at position n
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for _ in range(2, n+1):
            a, b = b, a + b
        return b

# Example usage
if __name__ == "__main__":
    num = 10
    print(f"The {num}th Fibonacci number is: {fibonacci(num)}")
    
    # Print the first 15 Fibonacci numbers
    print("First 15 Fibonacci numbers:")
    for i in range(1, 16):
        print(fibonacci(i), end=" ")
\`\`\`

This code includes:

1. A function to compute Fibonacci numbers
2. Docstring documentation
3. Example usage in the main block
4. A loop to print the first 15 numbers

You can modify the parameters or output format as needed. The Fibonacci sequence here starts with fib(1) = 1, fib(2) = 1.
`

export function ChatContainer({
  messages,
  children,
  height = 680,
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

  const getAvatarInfo = (m: ChatMessage): { avatar?: string; name?: string } => {
    const meta = (m.metadata ?? {}) as { avatar?: string; name?: string }
    return {
      avatar: meta.avatar,
      name: meta.name,
    }
  }
  //console.log('messages', messages)
  // 将消息转换为 Ant Design X Conversations 需要的格式
  const conversationItems = React.useMemo(
    () =>
      messages.map((m) => {
        const text = getTextFromMessage(m)
        const { avatar, name } = getAvatarInfo(m)
        const isUser = m.role === 'user'
        const isAssistant = m.role === 'assistant'

        const bubbleContent = (
          <div className="[&_code]:font-mono [&_code]:text-[0.8125rem] [&_p]:my-1">
            <MarkdownRender text={text} />
            <MarkdownRender text={testText} />
            {/* 预留插件渲染位 */}
            {/* {m.plugins?.map((p, i) => (
          <div key={i}>插件：{p.type}</div>
        ))} */}
          </div>
        )

        return {
          key: m.id,
          placement: isUser ? ('end' as const) : ('start' as const),
          avatar: avatar ? (
            <Avatar src={avatar} size={32}>
              {name?.[0] || m.role[0].toUpperCase()}
            </Avatar>
          ) : undefined,
          role: m.role,
          content: bubbleContent,
          variant: isUser ? ('shadow' as const) : ('borderless' as const),
          styles: {
            content: {
              borderRadius: 28,
              backgroundColor: isUser ? '#e4e4e7' : 'transparent',
              boxShadow: isAssistant ? 'none' : undefined,
              lineHeight: '1.6',
              padding: '2px 12px',
              minHeight: '20px',
              //maxWidth: isUser ? '100%' : '90%',
            },
          },
        }
      }),
    [messages],
  )

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
        '[&_.ant-card-head]:min-h-[10px] [&_.ant-card-head]:px-3 [&_.ant-card-head]:py-1 [&_.ant-card-head]:border-b-0',
        '[&_.ant-card-head-title]:border-b-0 [&_.ant-card-head-title]:leading-5 [&_.ant-card-head-title]:p-0',
        '[&_.ant-card-body]:flex [&_.ant-card-body]:flex-col [&_.ant-card-body]:px-1 [&_.ant-card-body]:py-0',
        className,
      )}
      styles={{
        body: {
          //height: typeof height === 'number' ? `${height}px` : height,
          minHeight: '480px', // 最小高度
          maxHeight: typeof height === 'number' ? `${height}px` : height, // 最大高度
          height: 'auto', // 自动高度，根据内容增长
        },
      }}
    >
      {/* 会话主体 - 使用 Ant Design X 的 Conversations 组件 */}
      <div className="flex-1 overflow-hidden flex text-[0.6rem] leading-6 font-sans pt-2 pb-1">
        <Bubble.List
          items={conversationItems}
          autoScroll={false}
          //style={{ overflowY: 'auto', height: '100%' }}
          className="scrollbar-thumb-only overflow-y-auto"
        />
      </div>

      {/* 底部输入区（来自外部） */}
      <div className="border-0 py-1">{children}</div>
    </Card>
  )
}
