import { useTranslation } from 'react-i18next'

import type { EducationEntry } from '@/components/about/EducationTimeline'
import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import { useGetProjectsQuery } from '@/services/projectsApi'
import type { Quest, QuestDetails } from '@/types'
import { timelineAnchor, type TimelineKind } from '@/utils/timelineAnchor'

import { useLanguage } from './useLanguage'

const TAGS_COUNT = 3

/** Newest completion first; `YYYY-MM` strings sort chronologically. */
const byEndDesc = (a: Quest, b: Quest) =>
  (b.end ?? '').localeCompare(a.end ?? '')

interface CvEntry {
  start: string
  end: string | null
  quest: QuestDetails
}

/** A CV entry as a quest, linked to its entry on the About page timeline. */
const cvQuest = (kind: TimelineKind, title: string, entry: CvEntry): Quest => {
  const anchor = timelineAnchor(kind, entry.start)
  return {
    key: anchor,
    kind,
    to: `/about-me#${anchor}`,
    title,
    start: entry.start,
    end: entry.end ?? undefined,
    ...entry.quest,
  }
}

export interface QuestLog {
  active: Quest[]
  completed: Quest[]
}

/**
 * Home quest log built from the CV copy and the published projects. A CV
 * entry without an `end` month is active; everything else is completed.
 */
export const useQuests = (): QuestLog => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data: projects = [] } = useGetProjectsQuery()

  const experience = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]
  const education = t('about.education', {
    returnObjects: true,
  }) as EducationEntry[]

  const cvQuests = [
    ...experience.map((entry) => cvQuest('work', entry.role, entry)),
    ...education.map((entry) => cvQuest('study', entry.degree, entry)),
  ]
  const projectQuests = projects.map((project): Quest => ({
    key: `project-${project.slug}`,
    kind: 'project',
    to: `/projects/${project.slug}`,
    title: localize(project.title),
    end: project.created_at.slice(0, 7),
    tags: project.technologies.slice(0, TAGS_COUNT).join(' · '),
  }))

  return {
    active: cvQuests.filter(({ end }) => !end),
    completed: [...cvQuests.filter(({ end }) => end), ...projectQuests].sort(
      byEndDesc,
    ),
  }
}
