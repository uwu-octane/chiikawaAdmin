'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowDownIcon } from 'lucide-react'
import type { ComponentProps, HTMLAttributes } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Magnetic } from '../motion-primitives/magnetic'
import { AnimatePresence, motion } from 'motion/react'

type ConversationContextType = {
  containerRef: React.RefObject<HTMLDivElement | null>
  isAtBottom: boolean
  showScrollButton: boolean
  scrollToBottom: (smooth?: boolean) => void
}

const ConversationContext = createContext<ConversationContextType | null>(null)

const useConversation = () => {
  const context = useContext(ConversationContext)
  if (!context) {
    throw new Error('Conversation components must be used within Conversation')
  }
  return context
}

export type ConversationProps = HTMLAttributes<HTMLDivElement>

export const Conversation = ({ className, children, ...props }: ConversationProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollButton, setShowScrollButton] = useState(false)

  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      })
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container

      const atBottom = scrollHeight - scrollTop - clientHeight < 50
      // 判断是否有滚动条（内容超过容器高度）
      const hasOverflow = scrollHeight > clientHeight
      setIsAtBottom(atBottom)
      // 只有当有滚动条且不在底部时才显示按钮
      setShowScrollButton(hasOverflow && !atBottom)
    }

    // 使用 ResizeObserver 监听内容变化
    const resizeObserver = new ResizeObserver(() => {
      handleScroll()
    })

    container.addEventListener('scroll', handleScroll, { passive: true })
    resizeObserver.observe(container)
    handleScroll() // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  })

  const contextValue: ConversationContextType = {
    containerRef,
    isAtBottom,
    showScrollButton,
    scrollToBottom,
  }

  return (
    <ConversationContext.Provider value={contextValue}>
      <div
        className={cn(
          'relative flex flex-col h-full min-h-0', // 只负责撑满 & 提供 relative
        )}
        {...props}
      >
        <div ref={containerRef} className={cn('min-h-0', className)} {...props}>
          {children}
        </div>
        <ConversationScrollButton />
      </div>
    </ConversationContext.Provider>
  )
}

export type ConversationContentProps = HTMLAttributes<HTMLDivElement>

export const ConversationContent = ({
  className,
  children,
  ...props
}: ConversationContentProps) => {
  const { scrollToBottom, isAtBottom } = useConversation()
  const childrenCountRef = useRef(0)

  // Auto-scroll to bottom when new messages arrive, but only if user is already near bottom
  useEffect(() => {
    const childrenArray = Array.isArray(children) ? children : children ? [children] : []
    const newCount = childrenArray.length

    // Only scroll if:
    // 1. There are new children (count increased)
    // 2. User is already at or near bottom
    if (newCount > childrenCountRef.current && isAtBottom) {
      scrollToBottom(true)
    }

    childrenCountRef.current = newCount
  }, [children, isAtBottom, scrollToBottom])

  return (
    <div
      className={cn(
        'flex-1  space-y-4 pl-2 pr-0',

        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export type ConversationScrollButtonProps = ComponentProps<typeof Button>

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { showScrollButton, scrollToBottom } = useConversation()

  return (
    <AnimatePresence>
      {showScrollButton && (
        <motion.div
          // 让它永远相对会话容器底部定位
          className={cn('absolute bottom-4 left-1/2 -translate-x-1/2 z-50')}
          initial={{ opacity: 0, y: 12, scale: 0.8 }} // 出现：下面一点 & 变小
          animate={{ opacity: 1, y: 0, scale: 1 }} // 到位：上来 & 变大
          exit={{ opacity: 0, y: 12, scale: 0.8 }} // 消失：往下缩小
          transition={{ type: 'spring', bounce: 0.25, duration: 0.35 }}
        >
          <Magnetic intensity={0.4} range={150}>
            <Button
              className={cn('rounded-full shadow-lg', 'size-5 p-0', className)}
              onClick={() => scrollToBottom(true)}
              {...props}
            >
              <Magnetic intensity={0.4} range={150}>
                <ArrowDownIcon className="h-3 w-3" />
                <span className="sr-only">Scroll to bottom</span>
              </Magnetic>
            </Button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
