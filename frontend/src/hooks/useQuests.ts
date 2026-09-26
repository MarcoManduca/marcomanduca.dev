import { useTranslation } from 'react-i18next'

import type { EducationEntry } from '@/components/about/EducationTimeline'
import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import { useGetProjectsQuery } from '@/services/projectsApi'
import type { Quest } from '@/types'

import { useLanguage } from './useLanguage'

const TAGS_COUNT = 3

/** Newest completion first; `YYYY-MM` strings sort chronologically. */
const byEndDesc = (a: Quest, b: Quest) =>
  (b.end ?? '').localeCompare(a.end ?? '')

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

  const cvQuests: Quest[] = [
    ...experience.map(({ start, end, role, quest }) => ({
      key: `work-${start}`,
      kind: 'work' as const,
      to: '/about-me',
      title: role,
      start,
      end: end ?? undefined,
      ...quest,
    })),
    ...education.map(({ start, end, degree, quest }) => ({
      key: `study-${start}`,
      kind: 'study' as const,
      to: '/about-me',
      title: degree,
      start,
      end: end ?? undefined,
      ...quest,
    })),
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
