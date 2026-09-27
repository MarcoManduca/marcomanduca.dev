import { useTranslation } from 'react-i18next'

import { useLanguage } from '@/hooks/useLanguage'
import type { Project } from '@/types'

import { HeroCover } from './HeroCover'
import { ProjectActions } from './ProjectActions'
import { ProjectChips } from './ProjectChips'
import { LABEL } from './styles'

interface ProjectHeroProps {
  project: Project
}

/** Opening of the project page: what it is, and where to go from here. */
export const ProjectHero = ({ project }: ProjectHeroProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()

  return (
    <section
      aria-labelledby="project-title"
      className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14"
    >
      <div className="flex flex-col gap-5">
        <ProjectChips project={project} />
        <h1
          id="project-title"
          className="text-[44px] font-extrabold leading-[0.95] text-heading [overflow-wrap:anywhere] sm:text-6xl lg:text-7xl"
        >
          {localize(project.title)}
        </h1>
        <p className="max-w-[660px] text-lg leading-relaxed text-body sm:text-xl">
          {localize(project.description)}
        </p>
        <dl className="flex flex-col gap-1">
          <dt className={LABEL}>{t('projects.detail.license')}</dt>
          <dd className="text-heading">{project.license}</dd>
        </dl>
        <div className="mt-2">
          <ProjectActions project={project} />
        </div>
      </div>
      <HeroCover project={project} />
    </section>
  )
}
