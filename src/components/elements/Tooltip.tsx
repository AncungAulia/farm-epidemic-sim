'use client'

import { useState } from 'react'
import * as RadixTooltip from '@radix-ui/react-tooltip'

interface TooltipProps {
  content:  React.ReactNode
  children: React.ReactNode
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      {children}
    </RadixTooltip.Provider>
  )
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <RadixTooltip.Root open={open} onOpenChange={setOpen}>
      <RadixTooltip.Trigger asChild onClick={() => setOpen(o => !o)}>
        {children}
      </RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={6}
          className="z-50 max-w-56 rounded-md bg-(--panel) border border-(--border) px-3 py-2 text-[12px] text-(--muted) leading-relaxed shadow-lg animate-in fade-in-0 zoom-in-95"
        >
          {content}
          <RadixTooltip.Arrow className="fill-(--border)" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  )
}
