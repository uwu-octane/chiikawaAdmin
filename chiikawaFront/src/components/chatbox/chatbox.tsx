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
import { ChatContainer } from './conversation'
import ChatInput from './chatinput'
import { useChat } from '@ai-sdk/react'

export function ChatPopoverLauncher() {
  const handleNewChat = () => {
    // TODO: 重置会话
    console.warn('new chat')
  }
  const handleSend = async (value: string) => {
    // TODO: 发送消息
    console.warn('send', value)
  }
  const handleStop = () => {
    // TODO: 停止生成
    console.warn('stop')
  }
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
          <PopoverBody onNewChat={handleNewChat} onSend={handleSend} onStop={handleStop} />
        </MorphingPopoverContent>
      </MorphingPopover>
    </div>
  )
}

type PopoverBodyProps = {
  onNewChat: () => void
  onSend: (value: string) => void
  onStop?: () => void
}

function PopoverBody({ onNewChat, onSend, onStop }: PopoverBodyProps) {
  const { isOpen, close } = useMorphingPopover()
  const contentRef = React.useRef<HTMLDivElement>(null)

  const { messages, status } = useChat()

  React.useEffect(() => {
    if (!isOpen) return
    const frame = requestAnimationFrame(() => {
      const textarea = contentRef.current?.querySelector('textarea')
      textarea?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [isOpen])

  const isSending = status === 'submitted' || status === 'streaming'

  return (
    <div ref={contentRef} className="flex flex-col items-center gap-3 w-full">
      <ChatContainer
        items={[]}
        activeItemId=""
        onSelect={() => {}}
        messages={messages}
        onNewChat={onNewChat}
        onToggleSidebar={() => {}}
        onClose={close}
      >
        <ActionDock actions={testActions} />
        <ChatInput isLoading={isSending} onSend={onSend} onStop={onStop} />
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
