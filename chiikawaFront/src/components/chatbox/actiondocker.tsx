'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Magnetic } from '@/components/motion-primitives/magnetic'
import { Dock, DockItem, DockIcon } from '@/components/motion-primitives/dock'

export type ActionItem = {
  id: string
  title: string
  icon: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}

type Props = {
  actions: ActionItem[]
  className?: string
}

export function ActionDock({ actions, className }: Props) {
  return (
    <div
      className={cn('pointer-events-auto w-full max-h-[40px] mx-auto flex items-end', className)}
      aria-label="AI action dock"
    >
      <div className="relative w-full flex justify-center">
        <Dock
          magnification={40}
          panelHeight={40}
          distance={0}
          className="gap-1 bg-transparent overflow-visible dark:bg-transparent shadow-none border-0 px-1"
        >
          {actions.map((item) => {
            const chipClass =
              'aspect-square h-6 w-6 rounded-lg border-none bg-transparent' +
              'shadow-md' +
              'transition-transform duration-200 hover:scale-[1] active:scale-95 ' +
              'flex items-center justify-center'

            const content = (
              <>
                {/* <DockLabel className="text-[10px]">{item.title}</DockLabel> */}
                <DockIcon className="[&>*]:size-4">{item.icon}</DockIcon>
              </>
            )

            const Chip = (
              <Magnetic intensity={0.08} range={120} springOptions={{ bounce: 0.12 }}>
                <Magnetic intensity={0.5} range={90} springOptions={{ bounce: 0.05 }}>
                  <DockItem className={chipClass}>{content}</DockItem>
                </Magnetic>
              </Magnetic>
            )

            return item.href ? (
              <a key={item.id} href={item.href} className="inline-flex" onClick={item.onClick}>
                {Chip}
              </a>
            ) : (
              <button key={item.id} type="button" className="inline-flex" onClick={item.onClick}>
                {Chip}
              </button>
            )
          })}
        </Dock>
      </div>
    </div>
  )
}
