import { useTranslation } from 'react-i18next'

import type { EducationEntry } from '@/components/about/EducationTimeline'
import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import { useGetArticlesQuery } from '@/services/learningApi'
import { useGetProjectsQuery } from '@/services/projectsApi'
import type { Mission } from '@/types'
import { formatDate } from '@/utils/formatDate'

import { useLanguage } from './useLanguage'

const DECK_TECH_COUNT = 3

/**
 * The four cards of the home mission deck: current job and studies (from the
 * CV copy), then the latest project and article. Until those load — or if
 * none is published — the previous job and degree take their place.
 */
export const useMissions = (): Mission[] => {
  const { t } = useTranslation()
  const { language, localize } = useLanguage()
  const { data: projects } = useGetProjectsQuery()
  const { data: articles } = useGetArticlesQuery()

  const [job, pastJob] = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]
  const [study, pastStudy] = t('about.education', {
    returnObjects: true,
  }) as EducationEntry[]
  const project = projects?.[0]
  const article = articles?.[0]
  const label = (kind: string, status: string) =>
    `${t(`home.deck.${kind}`)} · ${t(`home.deck.${status}`)}`

  return [
    {
      key: 'job',
      to: '/about-me',
      kind: label('mainQuest', 'inProgress'),
      status: 'active',
      title: `${job.role} — ${job.company}`,
      meta: job.period,
      featured: true,
    },
    {
      key: 'study',
      to: '/about-me',
      kind: label('study', 'inProgress'),
      status: 'active',
      title: study.degree,
      meta: study.period,
    },
    project
      ? {
          key: `project-${project.slug}`,
          to: `/projects/${project.slug}`,
          kind: label('project', 'completed'),
          status: 'done',
          title: localize(project.title),
          meta: project.technologies.slice(0, DECK_TECH_COUNT).join(' · '),
        }
      : {
          key: 'past-job',
          to: '/about-me',
          kind: label('job', 'completed'),
          status: 'done',
          title: `${pastJob.role} — ${pastJob.company}`,
          meta: pastJob.period,
        },
    article
      ? {
          key: `article-${article.slug}`,
          to: `/learning/${article.slug}`,
          kind: label('notes', 'new'),
          status: 'new',
          title: localize(article.title),
          meta: `${t(`learningCategories.${article.category}`)} · ${formatDate(article.updated_at, language)}`,
        }
      : {
          key: 'past-study',
          to: '/about-me',
          kind: label('study', 'completed'),
          status: 'done',
          title: pastStudy.degree,
          meta: pastStudy.period,
        },
  ]
}
