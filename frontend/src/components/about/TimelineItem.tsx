import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface TimelineItemProps {
  /** Element id, the target of `/about-me#<anchor>` links. */
  anchor: string
  /** Anchor of the entry the reader is looking at (see useScrollSpy). */
  activeAnchor: string | null
  children: ReactNode
}

/**
 * Entry of a vertical timeline; the active one is marked as the current
 * location and its dot glows. Anchored arrivals land at 30% of the viewport,
 * just above the scroll-spy reading line, so the target is the active entry.
 */
export const TimelineItem = ({
  anchor,
  activeAnchor,
  children,
}: TimelineItemProps) => {
  const active = anchor === activeAnchor

  return (
    <li
      id={anchor}
      aria-current={active ? 'location' : undefined}
      className="relative scroll-mt-[30vh] pb-8 pl-6"
    >
      <span
        className={cn(
          'absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full transition duration-300 motion-reduce:transition-none',
          active ? 'scale-125 bg-warm ring-4 ring-warm/30' : 'bg-highlight',
        )}
      />
      {children}
    </li>
  )
}
