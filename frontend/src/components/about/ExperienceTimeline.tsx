import type { QuestDetails } from '@/types'

import { Timeline } from './Timeline'

export interface ExperienceEntry {
  /** Start month, `YYYY-MM`. */
  start: string
  /** Completion month, `YYYY-MM`; `null` while still in progress. */
  end: string | null
  /** RPG framing used by the home quest log. */
  quest: QuestDetails
  period: string
  role: string
  company: string
  description: string
  highlights: string[]
}

interface ExperienceTimelineProps {
  entries: ExperienceEntry[]
  /** Anchor of the entry the reader is looking at. */
  activeAnchor: string | null
}

/** Timeline of work experience, each card with bullet highlights. */
export const ExperienceTimeline = ({
  entries,
  activeAnchor,
}: ExperienceTimelineProps) => (
  <Timeline kind="work" entries={entries} activeAnchor={activeAnchor}>
    {({ period, role, company, description, highlights }) => (
      <>
        <div className="text-left">
          <p className="font-mono text-xs text-muted">{period}</p>
          <h3 className="mt-1 font-semibold text-heading">
            {role} · <span className="text-accent">{company}</span>
          </h3>
        </div>
        {description && <p className="mt-2 text-sm">{description}</p>}
        {highlights.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body marker:text-highlight">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
      </>
    )}
  </Timeline>
)
