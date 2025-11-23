'use client'

import * as React from 'react'
import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
  useMorphingPopover,
} from '@/components/motion-primitives/morphing-popover'
import { ChatButton } from './chatbutton'
import { ActionDock } from './actiondocker'
import { testActions } from './testactions'
import { ChatContainer, type ChatMessage } from './conversation'
import ChatInput from './chatinput'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

export function ChatPopoverLauncher() {
  const triggerVariants = {
    initial: {
      opacity: 0,
      scale: 0.8,
      y: 8,
      filter: 'blur(6px)',
      transformOrigin: 'bottom right',
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transformOrigin: 'bottom right',
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 4,
      filter: 'blur(4px)',
      transformOrigin: 'bottom right',
    },
  } as const

  return (
    <div className="pointer-events-none fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] z-[60]">
      <MorphingPopover
        className="relative flex items-end justify-end pointer-events-auto"
        variants={triggerVariants}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
      >
        <MorphingPopoverTrigger asChild>
          <LauncherButton />
        </MorphingPopoverTrigger>

        <MorphingPopoverContent
          className="pointer-events-auto absolute right-0 bottom-0 z-[80]
                     w-[min(100vw,400px)] origin-bottom-right
                     bg-transparent border-none shadow-none p-0"
        >
          <PopoverBody />
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  )
}

function PopoverBody() {
  const { isOpen, close } = useMorphingPopover()
  const contentRef = React.useRef<HTMLDivElement>(null)

  const {
    //id: chatId,
    messages,
    status,
    //error,
    sendMessage,
    setMessages,
    stop,
  } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: 'http://localhost:8989/api/chat-round-vercel-stream',
    }),
  })

  React.useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() => {
      const textarea = contentRef.current?.querySelector('textarea')
      textarea?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  // 监听消息变化
  //   React.useEffect(() => {
  //     console.log('Messages count:', messages.length, 'Messages:', messages)
  //   }, [messages])

  const isSending = status === 'submitted' || status === 'streaming'

  const handleSend = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

    console.log('Sending message:', trimmed)

    // 最简单版本：只发文本
    await sendMessage({ text: trimmed })

    // 如果以后要带上 sessionId / 其他 body，可以这样：
    // await sendMessage(
    //   { text: trimmed },
    //   { body: { sessionId: currentSessionId } }
    // )
  }

  const handleNewChat = () => {
    // 先只清空本地 UI 消息，等接上 session store 再扩展
    //todo
    setMessages([])
  }

  const handleStop = () => {
    //todo
    stop()
  }
  return (
    <div ref={contentRef} className="flex flex-col items-center gap-3 w-full">
      <ChatContainer
        items={[]}
        activeItemId=""
        onSelect={() => {}}
        messages={messages}
        onNewChat={handleNewChat}
        onToggleSidebar={() => {}}
        onClose={close}
      >
        <ActionDock actions={testActions} />
        <ChatInput isLoading={isSending} onSend={handleSend} onStop={handleStop} />
      </ChatContainer>
    </div>
  )
}

function LauncherButton(props: React.ComponentProps<typeof ChatButton>) {
  const { isOpen } = useMorphingPopover()
  const { className, ...rest } = props
  return (
    <ChatButton
      aria-label="Chat with AI"
      className={
        (isOpen ? 'opacity-0 pointer-events-none [inert] aria-hidden' : 'pointer-events-auto') +
        (className ? ` ${className}` : '')
      }
      {...rest}
    />
  )
}
