import React from 'react'

import { Magnetic } from '@/components/motion-primitives/magnetic'
import { MessageCircle } from 'lucide-react'
import styles from './chatbox.module.scss'

type ChatButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const ChatButton = React.forwardRef<HTMLButtonElement, ChatButtonProps>(
  ({ className, ...rest }, ref) => {
    const outer = {
      intensity: 0.2,
      range: 150,
      actionArea: 'global' as const,
      springOptions: { bounce: 0.1 },
    }

    const inner = {
      intensity: 0.1,
      range: 150,
      actionArea: 'global' as const,
      springOptions: { bounce: 0.1 },
    }

    return (
      <Magnetic {...outer}>
        <button ref={ref} className={`${styles.chatButton} ${className ?? ''}`} {...rest}>
          <Magnetic {...inner}>
            <MessageCircle className="size-4" />
          </Magnetic>
        </button>
      </Magnetic>
    )
  },
)

ChatButton.displayName = 'ChatButton'
