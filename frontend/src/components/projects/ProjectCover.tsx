import { useLanguage } from '@/hooks/useLanguage'
import type { ProjectSummary } from '@/types'
import { safeMediaUrl } from '@/utils/safeUrl'

import { AreaArt } from './AreaArt'

interface ProjectCoverProps {
  project: Pick<ProjectSummary, 'areas' | 'cover'>
  /** Below the fold: let the browser defer the download. */
  lazy?: boolean
  draggable?: boolean
}

/**
 * A project's cover image filling its box, or the art of the project's first
 * area when there is no (safe) cover.
 */
export const ProjectCover = ({
  project,
  lazy = false,
  draggable,
}: ProjectCoverProps) => {
  const { localize } = useLanguage()
  const src = safeMediaUrl(project.cover?.src)

  if (!src || !project.cover) return <AreaArt area={project.areas[0]} />
  return (
    <img
      src={src}
      alt={localize(project.cover.alt)}
      draggable={draggable}
      loading={lazy ? 'lazy' : undefined}
      decoding={lazy ? 'async' : undefined}
      className="h-full w-full object-cover"
    />
  )
}
