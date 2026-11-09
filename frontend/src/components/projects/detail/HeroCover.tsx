import { areaStyle } from '@/components/projects/areaStyles'
import { ProjectCover } from '@/components/projects/ProjectCover'
import type { Project } from '@/types'
import { cn } from '@/utils/cn'

interface HeroCoverProps {
  project: Pick<Project, 'areas' | 'cover'>
}

/** The cover in the foil frame of the project's area, slightly tilted. */
export const HeroCover = ({ project }: HeroCoverProps) => {
  const area = project.areas[0]

  return (
    <div
      className={cn(
        'rounded-[22px] bg-gradient-to-br p-1.5 shadow-2xl lg:rotate-[1.5deg]',
        areaStyle(area).frame,
      )}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-[17px] bg-surface">
        <ProjectCover project={project} />
      </div>
    </div>
  )
}
