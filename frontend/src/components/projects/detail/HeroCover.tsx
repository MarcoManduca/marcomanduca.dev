import { AreaArt } from '@/components/projects/AreaArt'
import { areaStyle } from '@/components/projects/areaStyles'
import { useLanguage } from '@/hooks/useLanguage'
import type { Project } from '@/types'
import { cn } from '@/utils/cn'
import { safeMediaUrl } from '@/utils/safeUrl'

interface HeroCoverProps {
  project: Pick<Project, 'areas' | 'cover'>
}

/** The cover in the foil frame of the project's area, slightly tilted. */
export const HeroCover = ({ project }: HeroCoverProps) => {
  const { localize } = useLanguage()
  const area = project.areas[0]
  const src = safeMediaUrl(project.cover?.src)

  return (
    <div
      className={cn(
        'rounded-[22px] bg-gradient-to-br p-1.5 shadow-2xl lg:rotate-[1.5deg]',
        areaStyle(area).frame,
      )}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-[17px] bg-surface">
        {src && project.cover ? (
          <img
            src={src}
            alt={localize(project.cover.alt)}
            className="h-full w-full object-cover"
          />
        ) : (
          <AreaArt area={area} />
        )}
      </div>
    </div>
  )
}
