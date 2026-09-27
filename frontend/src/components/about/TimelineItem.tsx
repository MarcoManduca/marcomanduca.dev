import type { ReactNode } from 'react'

import { useHashTarget } from '@/hooks/useHashTarget'
import { cn } from '@/utils/cn'

interface TimelineItemProps {
  /** Element id, the target of `/about-me#<anchor>` links. */
  anchor: string
  children: ReactNode
}

/**
 * Entry of a vertical timeline. The one the URL hash points at (e.g. from a
 * home quest) is marked as the current location and its dot glows.
 */
export const TimelineItem = ({ anchor, children }: TimelineItemProps) => {
  const targeted = useHashTarget() === anchor

  return (
    <li
      id={anchor}
      aria-current={targeted ? 'location' : undefined}
      className="relative scroll-mt-24 pb-8 pl-6"
    >
      <span
        className={cn(
          'absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full',
          targeted ? 'bg-warm ring-4 ring-warm/30' : 'bg-highlight',
        )}
      />
      {children}
    </li>
  )
}
