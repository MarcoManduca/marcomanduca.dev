import { useMemo } from 'react'

import { useParams } from 'react-router'

import { ProjectAside } from '@/components/projects/detail/ProjectAside'
import { ProjectBody } from '@/components/projects/detail/ProjectBody'
import { ProjectHero } from '@/components/projects/detail/ProjectHero'
import { ProjectMetrics } from '@/components/projects/detail/ProjectMetrics'
import { ProjectPager } from '@/components/projects/detail/ProjectPager'
import { ProjectTopBar } from '@/components/projects/detail/ProjectTopBar'
import { QuestBriefCards } from '@/components/projects/detail/QuestBriefCards'
import { LabSection } from '@/components/projects/lab/LabSection'
import { ProjectGallery } from '@/components/projects/ProjectGallery'
import { Seo } from '@/components/seo/Seo'
import { ErrorState } from '@/components/ui/ErrorState'
import { Spinner } from '@/components/ui/Spinner'
import { useLanguage } from '@/hooks/useLanguage'
import { useProjectNeighbours } from '@/hooks/useProjectNeighbours'
import { useTrackProjectVisit } from '@/hooks/useTrackProjectVisit'
import { useGetProjectBySlugQuery } from '@/services/projectsApi'
import { isNotFoundError } from '@/utils/isNotFoundError'
import { markdownHeadings } from '@/utils/markdownHeadings'

import { NotFound } from './NotFound'

/**
 * A project page: hero, quest brief and key numbers, the long read with its
 * side column, the gallery, the optional lab last, and the nearby side
 * quests.
 */
export const ProjectDetail = () => {
  const { localize } = useLanguage()
  const { slug = '' } = useParams()
  const {
    data: project,
    error,
    isLoading,
    isError,
    refetch,
  } = useGetProjectBySlugQuery(slug)
  const neighbours = useProjectNeighbours(slug)
  useTrackProjectVisit(project?.slug)
  const markdown = localize(project?.content_markdown)
  // Parsing the whole body (unified + remark) is not free: once per text.
  const headings = useMemo(
    () => (markdown ? markdownHeadings(markdown) : []),
    [markdown],
  )

  if (isLoading) return <Spinner />
  if (isError && !isNotFoundError(error)) {
    return <ErrorState onRetry={() => void refetch()} />
  }
  if (!project) return <NotFound />

  return (
    <article className="flex flex-col gap-16 lg:gap-20">
      <Seo
        title={localize(project.title)}
        description={localize(project.description)}
        type="article"
        image={project.cover?.src ?? project.media[0]?.src}
      />
      <div className="flex flex-col gap-6">
        <ProjectTopBar neighbours={neighbours} />
        <ProjectHero project={project} />
      </div>
      <div className="flex flex-col gap-4">
        <QuestBriefCards brief={project.brief} />
        <ProjectMetrics metrics={project.metrics} />
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-16">
        <ProjectBody markdown={markdown} />
        <ProjectAside project={project} headings={headings} />
      </div>
      <ProjectGallery media={project.media} />
      {project.lab && <LabSection lab={project.lab} />}
      <ProjectPager neighbours={neighbours} />
    </article>
  )
}
