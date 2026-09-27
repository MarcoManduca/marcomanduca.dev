import { useTranslation } from 'react-i18next'

import type { QuestDetails } from '@/types'
import { cn } from '@/utils/cn'

import { CourseAreas } from './CourseAreas'
import { CourseCertificate, type Certificate } from './CourseCertificate'
import { CourseFacts, type CourseFact } from './CourseFacts'
import { CoursePlan } from './CoursePlan'
import { CARD_LINK } from './styles'
import { Timeline } from './Timeline'

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
  /** Department that runs the course. */
  department: string
  /** What the course is about, after its official page. */
  summary: string
  /** Class or level, duration, credits and language. */
  facts: CourseFact[]
  /** Main areas of study. */
  areas: string[]
  /** Courses of the study plan, when listed. */
  plan?: string[]
  /** Certification earned along the course. */
  certificate?: Certificate
  /** Official page of the course. */
  url: string
}

interface EducationTimelineProps {
  entries: EducationEntry[]
  /** Anchor of the entry the reader is looking at. */
  activeAnchor: string | null
}

/** Timeline of academic education, each card describing its course. */
export const EducationTimeline = ({
  entries,
  activeAnchor,
}: EducationTimelineProps) => {
  const { t } = useTranslation()

  return (
    <Timeline kind="study" entries={entries} activeAnchor={activeAnchor}>
      {(entry) => (
        <>
          <div className="text-left">
            <p className="font-mono text-xs text-muted">{entry.period}</p>
            <h3 className="mt-1 font-semibold text-heading">{entry.degree}</h3>
            <p className="mt-1 text-sm text-accent">{entry.school}</p>
            <p className="text-sm text-muted">{entry.department}</p>
          </div>
          <p className="mt-3 text-sm">{entry.summary}</p>
          <CourseFacts facts={entry.facts} />
          <CourseAreas areas={entry.areas} />
          {entry.certificate && (
            <CourseCertificate certificate={entry.certificate} />
          )}
          {entry.plan && <CoursePlan courses={entry.plan} />}
          <a
            href={entry.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(CARD_LINK, 'mt-5 inline-flex text-sm')}
          >
            {t('about.coursePage')} ↗
          </a>
        </>
      )}
    </Timeline>
  )
}
