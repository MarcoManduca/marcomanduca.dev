import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface StageLabelProps {
  side: 'left' | 'right'
  children: ReactNode
}

/** Names the image on one side of the comparison. */
export const StageLabel = ({ side, children }: StageLabelProps) => (
  <span
    className={cn(
      'pointer-events-none absolute top-3 rounded-lg bg-background/80 px-2.5 py-1 font-display text-sm font-bold uppercase tracking-[0.08em] text-heading',
      side === 'left' ? 'left-3' : 'right-3',
    )}
  >
    {children}
  </span>
)
