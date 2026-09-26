import type { QuestKind } from '@/types'

const PATHS: Record<QuestKind, string[]> = {
  // Briefcase
  work: [
    'M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7',
    'M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z',
    'M3 12.5h18',
  ],
  // Graduation cap
  study: [
    'M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z',
    'M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5',
    'M22 9.5V14',
  ],
  // Code brackets
  project: ['M8 6 3 12l5 6', 'm16 6 5 6-5 6', 'm13.5 4-3 16'],
}

interface QuestIconProps {
  kind: QuestKind
  className?: string
}

/** Symbol of a quest's domain (work, study, project). Decorative. */
export const QuestIcon = ({ kind, className }: QuestIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {PATHS[kind].map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
)
