import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type BadgeTone = 'blue' | 'green' | 'gray' | 'amber'

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-accent/15 text-accent',
  green: 'bg-success/15 text-success',
  gray: 'bg-muted/15 text-muted',
  amber: 'bg-highlight/15 text-highlight',
}

export const Badge = ({ tone = 'blue', className, children }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      TONE_CLASSES[tone],
      className,
    )}
  >
    {children}
  </span>
)
