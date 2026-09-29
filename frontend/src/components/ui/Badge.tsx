import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

type BadgeTone = 'blue' | 'green' | 'gray' | 'amber'

interface BadgeProps {
  tone?: BadgeTone
  className?: string
  children: ReactNode
}

// Text colours reach at least 4.5:1 on their tint over both the page and the
// card backgrounds, in both themes (the badge text is 12px).
const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-accent/15 text-accent-deep dark:text-accent-hover',
  green: 'bg-success/15 text-success',
  gray: 'bg-muted/15 text-body',
  amber: 'bg-highlight/15 text-warm-hover dark:text-highlight',
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
