import type { ReactNode } from 'react'

import type { QuestKind } from '@/types'
import { timelineAnchor } from '@/utils/timelineAnchor'

import { TimelineItem } from './TimelineItem'

interface TimelineProps<Entry> {
  /** Anchor prefix of the entries, `work` or `study`. */
  kind: QuestKind
  /** CV entries, newest first, each keyed by its start month. */
  entries: Entry[]
  /** Anchor of the entry the reader is looking at. */
  activeAnchor: string | null
  /** Content of an entry's card. */
  children: (entry: Entry) => ReactNode
}

/** Vertical timeline of CV entries, one card each on a scroll-lit rail. */
export const Timeline = <Entry extends { start: string }>({
  kind,
  entries,
  activeAnchor,
  children,
}: TimelineProps<Entry>) => {
  const anchors = entries.map(({ start }) => timelineAnchor(kind, start))
  const activeIndex = anchors.findIndex((anchor) => anchor === activeAnchor)

  return (
    <ol className="mt-5 flex flex-col gap-6">
      {entries.map((entry, index) => (
        <TimelineItem
          key={anchors[index]}
          anchor={anchors[index]}
          active={index === activeIndex}
          passed={index < activeIndex}
          last={index === entries.length - 1}
        >
          {children(entry)}
        </TimelineItem>
      ))}
    </ol>
  )
}
