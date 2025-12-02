import React from 'react'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type ChatButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>

export const ChatButton = React.forwardRef<HTMLButtonElement, ChatButtonProps>(
  ({ className, ...rest }, ref) => {
    const outer = {
      intensity: 0.3,
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

    const buttonClasses = cn(
      'inline-flex size-8 items-center justify-center rounded-full border border-zinc-200',
      'bg-zinc-950 text-zinc-50 shadow-md transition-all duration-300',
      'hover:scale-105 hover:bg-zinc-800 active:scale-95',
      'dark:border-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
      className,
    )

    return (
      <Magnetic {...outer}>
        <button ref={ref} className={buttonClasses} {...rest}>
          <Magnetic {...inner}>
            <MessageCircle className="size-4" />
          </Magnetic>
        </button>
      </Magnetic>
    )
  },
)

ChatButton.displayName = 'ChatButton'
