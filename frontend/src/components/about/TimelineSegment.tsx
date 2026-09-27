import { type RefObject, useRef } from 'react'

import { useSegmentFill } from '@/hooks/useSegmentFill'

interface TimelineSegmentProps {
  /** The entry the segment leaves from. */
  entry: RefObject<HTMLElement>
  /** Whether the entry sits above the active one. */
  passed: boolean
}

/**
 * Stretch of the timeline rail from an entry's dot to the next entry's dot,
 * lit from the top as the reader scrolls from one card to the next. It
 * reaches past the list gap (`gap-6`) to the next dot, 34px into its entry.
 */
export const TimelineSegment = ({ entry, passed }: TimelineSegmentProps) => {
  const segment = useRef<HTMLSpanElement>(null)
  const fill = useSegmentFill(entry, segment, passed)

  return (
    <span
      ref={segment}
      aria-hidden="true"
      className="absolute -bottom-[58px] left-[4px] top-[34px] w-0.5 overflow-hidden rounded-full bg-edge"
    >
      <span
        className="block h-full origin-top bg-gradient-to-b from-highlight to-warm"
        style={{ transform: `scaleY(${fill})` }}
      />
    </span>
  )
}
