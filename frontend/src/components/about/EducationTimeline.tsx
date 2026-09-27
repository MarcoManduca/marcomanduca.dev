import type { QuestDetails } from '@/types'
import { timelineAnchor } from '@/utils/timelineAnchor'

import { TimelineItem } from './TimelineItem'

export interface EducationEntry {
  /** Start month, `YYYY-MM`. */
  start: string
  /** Completion month, `YYYY-MM`; `null` while still in progress. */
  end: string | null
  /** RPG framing used by the home quest log. */
  quest: QuestDetails
  period: string
  degree: string
  school: string
}

interface EducationTimelineProps {
  entries: EducationEntry[]
}

/** Vertical timeline of academic education. */
export const EducationTimeline = ({ entries }: EducationTimelineProps) => (
  <ol className="mt-5 border-l border-edge">
    {entries.map(({ start, period, degree, school }) => (
      <TimelineItem key={start} anchor={timelineAnchor('study', start)}>
        <p className="font-mono text-xs text-muted">{period}</p>
        <h3 className="mt-1 font-semibold text-heading">{degree}</h3>
        <p className="mt-1 text-sm text-accent">{school}</p>
      </TimelineItem>
    ))}
  </ol>
)
