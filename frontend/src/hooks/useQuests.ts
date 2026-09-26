import { useTranslation } from 'react-i18next'

import type { EducationEntry } from '@/components/about/EducationTimeline'
import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import { useGetProjectsQuery } from '@/services/projectsApi'
import type { Quest } from '@/types'
import { endYear } from '@/utils/endYear'

import { useLanguage } from './useLanguage'

const SUBTITLE_TECH_COUNT = 3

const byYearDesc = (a: Quest, b: Quest) => (b.year ?? 0) - (a.year ?? 0)

interface CvQuest {
  current: boolean
  quest: Quest
}

export interface QuestLog {
  active: Quest[]
  completed: Quest[]
}

/**
 * Home quest log: CV entries flagged `current` are active; past jobs and
 * degrees plus published projects are completed, newest first.
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

  const cvQuests: CvQuest[] = [
    ...experience.map((job) => ({
      current: job.current,
      quest: {
        key: `work-${job.period}`,
        kind: 'work' as const,
        to: '/about-me',
        title: `${job.role} — ${job.company}`,
        subtitle: job.period,
        year: job.current ? undefined : endYear(job.period),
      },
    })),
    ...education.map((study) => ({
      current: study.current,
      quest: {
        key: `study-${study.period}`,
        kind: 'study' as const,
        to: '/about-me',
        title: study.degree,
        subtitle: `${study.school} · ${study.period}`,
        year: study.current ? undefined : endYear(study.period),
      },
    })),
  ]
  const projectQuests = projects.map((project): Quest => ({
    key: `project-${project.slug}`,
    kind: 'project',
    to: `/projects/${project.slug}`,
    title: localize(project.title),
    subtitle: project.technologies.slice(0, SUBTITLE_TECH_COUNT).join(' · '),
    year: new Date(project.created_at).getFullYear(),
  }))

  return {
    active: cvQuests.filter(({ current }) => current).map(({ quest }) => quest),
    completed: [
      ...cvQuests.filter(({ current }) => !current).map(({ quest }) => quest),
      ...projectQuests,
    ].sort(byYearDesc),
  }
}
