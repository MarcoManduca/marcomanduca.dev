export interface EducationEntry {
  /** Still in progress: shown among the active quests on the home page. */
  current: boolean
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
    {entries.map(({ period, degree, school }) => (
      <li key={period} className="relative pb-8 pl-6">
        <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-highlight" />
        <p className="font-mono text-xs text-muted">{period}</p>
        <h3 className="mt-1 font-semibold text-heading">{degree}</h3>
        <p className="mt-1 text-sm text-accent">{school}</p>
      </li>
    ))}
  </ol>
)
