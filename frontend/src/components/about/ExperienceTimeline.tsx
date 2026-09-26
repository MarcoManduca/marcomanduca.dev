import type { QuestDetails } from '@/types'

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
}

/** Vertical timeline of work experience, each entry with bullet highlights. */
export const ExperienceTimeline = ({ entries }: ExperienceTimelineProps) => (
  <ol className="mt-5 border-l border-edge">
    {entries.map(({ period, role, company, description, highlights }) => (
      <li key={period} className="relative pb-8 pl-6">
        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-highlight" />
        <p className="font-mono text-xs text-muted">{period}</p>
        <h3 className="mt-1 font-semibold text-heading">
          {role} · <span className="text-accent">{company}</span>
        </h3>
        {description && <p className="mt-1 text-sm">{description}</p>}
        {highlights.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-body marker:text-highlight">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ol>
)
