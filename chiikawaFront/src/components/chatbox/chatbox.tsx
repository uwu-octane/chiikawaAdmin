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
import { useChatSession } from '@/hooks/useChatSession'
import { MessageSquare } from 'lucide-react'
import type { DropdownItem } from './chatdropdown'

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
    <div className="pointer-events-none fixed right-6 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] z-60">
      <MorphingPopover
        className="relative flex items-end justify-end pointer-events-auto"
        variants={triggerVariants}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.3 }}
      >
        <MorphingPopoverTrigger asChild>
          <LauncherButton />
        </MorphingPopoverTrigger>

        <MorphingPopoverContent
          className="pointer-events-auto absolute right-0 bottom-0 z-80
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

  // 🔴 使用统一的 useChatSession hook（集成所有功能）
  const {
    messages,
    chatStatus,
    sendMessage,
    stop,
    regenerate,
    startNewSession,
    sessions,
    sessionId,
    switchToSession,
  } = useChatSession()

  // ========== 状态管理 ==========
  const [copiedMessageId, setCopiedMessageId] = React.useState<string | null>(null)

  // ========== 映射 sessions 到 DropdownItem ==========
  const dropdownItems: DropdownItem[] = React.useMemo(() => {
    return sessions.map((session) => ({
      id: session.id,
      title: session.title,
      icon: <MessageSquare className="size-3.5" />,
      onClick: () => switchToSession(session.id),
      updatedAt: session.updatedAt,
    }))
  }, [sessions, switchToSession])

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

  const isSending = chatStatus === 'submitted' || chatStatus === 'streaming'

  // ========== 业务回调（集中管理）==========

  // AI 相关回调
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

  const handleStop = () => {
    stop()
  }

  const handleRegenerate = () => {
    regenerate()
  }

  // 会话管理回调
  const handleNewChat = () => {
    console.log('[PopoverBody] Creating new chat session')
    // 创建新的会话（会自动切换到新的 Chat 实例）
    startNewSession()
    // 注意：页面会自动 re-render，useCurrentChat 会获取新的 sessionId
  }

  // UI 交互回调
  const handleCopy = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 3000)
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  const handleEdit = (message: ChatMessage) => {
    // TODO: 实现编辑逻辑
    console.log('Edit message:', message)
  }

  // Popover 控制回调
  const handleClose = () => {
    close()
  }

  const handleToggleSidebar = () => {
    // TODO: 实现侧边栏逻辑
    console.log('Toggle sidebar')
  }
  // ========== 渲染 ==========
  return (
    <div ref={contentRef} className="flex flex-col items-center gap-3 w-full">
      <ChatContainer
        items={dropdownItems}
        activeItemId={sessionId}
        onSelect={switchToSession}
        messages={messages}
        copiedMessageId={copiedMessageId}
        onNewChat={handleNewChat}
        onToggleSidebar={handleToggleSidebar}
        onClose={handleClose}
        onRegenerate={handleRegenerate}
        onCopy={handleCopy}
        onEditUserMessage={handleEdit}
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
