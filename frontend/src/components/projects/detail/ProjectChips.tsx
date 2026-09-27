import { useTranslation } from 'react-i18next'

import { AreaChip } from '@/components/projects/AreaChip'
import { CHIP } from '@/components/projects/chip'
import { StrokeIcon } from '@/components/ui/StrokeIcon'
import type { Project } from '@/types'
import { cn } from '@/utils/cn'

import { CONTEXT_ICONS } from './icons'

interface ProjectChipsProps {
  project: Pick<Project, 'areas' | 'context'>
}

/** How the project is classified: its areas and context. */
export const ProjectChips = ({ project }: ProjectChipsProps) => {
  const { t } = useTranslation()

  return (
    <ul
      aria-label={t('projects.detail.classification')}
      className="flex flex-wrap items-center gap-2"
    >
      {project.areas.map((area) => (
        <li key={area}>
          <AreaChip area={area} />
        </li>
      ))}
      <li>
        <span className={cn(CHIP, 'bg-surface text-body')}>
          <StrokeIcon
            paths={CONTEXT_ICONS[project.context]}
            className="h-3.5 w-3.5"
          />
          {t(`projectContexts.${project.context}`)}
        </span>
      </li>
    </ul>
  )
}
