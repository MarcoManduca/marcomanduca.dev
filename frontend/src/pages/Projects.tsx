import { useMemo, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ProjectCard } from '@/components/projects/ProjectCard'
import {
  ProjectFilters,
  type ProjectFiltersValue,
} from '@/components/projects/ProjectFilters'
import { Seo } from '@/components/seo/Seo'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import { useGetProjectsQuery } from '@/services/projectsApi'
import { useGetTechnologiesQuery } from '@/services/technologiesApi'
import type { Project } from '@/types'

const matchesSearch = (
  project: Project,
  search: string,
  localize: (text: Project['title']) => string,
): boolean => {
  const haystack =
    `${localize(project.title)} ${localize(project.description)}`.toLowerCase()
  return haystack.includes(search.toLowerCase())
}

export const Projects = () => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const { data, isLoading, isError } = useGetProjectsQuery()
  const { data: technologies = [] } = useGetTechnologiesQuery()

  const [filters, setFilters] = useState<ProjectFiltersValue>({
    search: '',
    category: '',
    technology: '',
  })

  const filtered = useMemo(() => {
    const items = data ?? []
    return items.filter(
      (project) =>
        (!filters.category || project.category === filters.category) &&
        (!filters.technology ||
          project.technologies.includes(filters.technology)) &&
        (!filters.search || matchesSearch(project, filters.search, localize)),
    )
  }, [data, filters, localize])

  return (
    <>
      <Seo title={t('projects.title')} description={t('projects.subtitle')} />
      <h1 className="text-3xl font-bold text-heading">{t('projects.title')}</h1>
      <p className="mt-2 text-muted">{t('projects.subtitle')}</p>
      <div className="mt-8">
        <ProjectFilters
          value={filters}
          technologies={technologies}
          onChange={setFilters}
        />
      </div>
      {isLoading && <Spinner />}
      {isError && <p className="mt-8 text-red-400">{t('common.error')}</p>}
      {data && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      )}
      {data && filtered.length === 0 && (
        <p className="mt-8 text-muted">{t('projects.empty')}</p>
      )}
    </>
  )
}
