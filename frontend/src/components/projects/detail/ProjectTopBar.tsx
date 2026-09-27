import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { ProjectNeighbours } from '@/hooks/useProjectNeighbours'
import { twoDigits } from '@/utils/twoDigits'

interface ProjectTopBarProps {
  neighbours: ProjectNeighbours | null
}

/** Back to the projects, and the project's number in the side quests. */
export const ProjectTopBar = ({ neighbours }: ProjectTopBarProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between gap-4">
      <Link
        to="/projects"
        className="flex min-h-11 items-center font-display text-base font-bold uppercase tracking-[0.04em] text-highlight hover:text-heading"
      >
        ← {t('projects.backToProjects')}
      </Link>
      {neighbours && (
        <span className="font-display text-[15px] font-bold tracking-[0.08em] text-muted">
          {t('home.sideQuests.number', {
            index: twoDigits(neighbours.number),
            total: twoDigits(neighbours.total),
          })}
        </span>
      )}
    </div>
  )
}
