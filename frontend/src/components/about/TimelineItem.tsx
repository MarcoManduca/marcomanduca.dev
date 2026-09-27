import { type ReactNode, useRef } from 'react'

import { Card } from '@/components/ui/Card'
import { cn } from '@/utils/cn'

import { TimelineSegment } from './TimelineSegment'

interface TimelineItemProps {
  /** Element id, the target of `/about-me#<anchor>` links. */
  anchor: string
  /** Whether the reader is looking at this entry (see useScrollSpy). */
  active: boolean
  /** Whether the entry sits above the active one. */
  passed: boolean
  /** Whether a segment of the rail leads on to a following entry. */
  last: boolean
  children: ReactNode
}

/**
 * Entry of a vertical timeline: a card with its dot on the rail, level with
 * the first line of the card. The active one is marked as the current
 * location, its dot glows and its card is outlined. Anchored arrivals land at
 * 30% of the viewport, just above the scroll-spy reading line, so the target
 * is the active entry.
 */
export const TimelineItem = ({
  anchor,
  active,
  passed,
  last,
  children,
}: TimelineItemProps) => {
  const entry = useRef<HTMLLIElement>(null)

  return (
    <li
      ref={entry}
      id={anchor}
      aria-current={active ? 'location' : undefined}
      className="relative scroll-mt-[30vh] pl-7 sm:pl-8"
    >
      {!last && <TimelineSegment entry={entry} passed={passed} />}
      <span
        aria-hidden="true"
        className={cn(
          'absolute left-0 top-[29px] h-2.5 w-2.5 rounded-full transition duration-300 motion-reduce:transition-none',
          active ? 'scale-125 bg-warm ring-4 ring-warm/30' : 'bg-highlight',
        )}
      />
      <Card className={cn(active && 'border-warm/70')}>{children}</Card>
    </li>
  )
}
