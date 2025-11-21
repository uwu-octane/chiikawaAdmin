import { Plus, Sidebar, X } from 'lucide-react'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { cn } from '@/lib/utils'

const headerIconBtnClass = cn(
  'appearance-none bg-transparent border-0 rounded-full',
  'w-6 h-6 inline-flex items-center justify-center p-0 cursor-pointer',
  'transition-all duration-150 ease-in-out',
  'hover:bg-[#f7f7f7] hover:border-black/8 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]',
  'active:translate-y-[0.5px] active:scale-98',
  'dark:bg-[#0a0a0a] dark:border-white/8 dark:hover:bg-[#111]',
)

const headerIconClass = cn('w-3.5 h-3.5 text-zinc-700 dark:text-gray-200')

export const HeaderExtra = (
  onNewChat: () => void,
  onToggleSidebar: () => void,
  onClose: () => void,
) => {
  return (
    <div className="inline-flex gap-1.5 items-center" aria-label="Chat header actions">
      <Magnetic>
        <button
          type="button"
          className={headerIconBtnClass}
          onClick={onNewChat}
          aria-label="新建聊天"
          title="新建聊天"
        >
          <Plus className={headerIconClass} />
        </button>
      </Magnetic>
      <Magnetic>
        <button
          type="button"
          className={headerIconBtnClass}
          onClick={onToggleSidebar}
          aria-label="切换侧边栏"
          title="切换侧边栏"
        >
          <Sidebar className={headerIconClass} />
        </button>
      </Magnetic>
      <Magnetic>
        <button
          type="button"
          className={headerIconBtnClass}
          onClick={onClose}
          aria-label="关闭"
          title="关闭"
        >
          <X className={headerIconClass} />
        </button>
      </Magnetic>
    </div>
  )
}
