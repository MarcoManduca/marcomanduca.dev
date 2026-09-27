import { useTranslation } from 'react-i18next'

import type { ProjectNeighbours } from '@/hooks/useProjectNeighbours'

import { PagerLink } from './PagerLink'

interface ProjectPagerProps {
  neighbours: ProjectNeighbours | null
}

/** Links to the previous and the next side quest. */
export const ProjectPager = ({ neighbours }: ProjectPagerProps) => {
  const { t } = useTranslation()

  if (!neighbours || neighbours.total < 2) return null
  const { number, total, previous, next } = neighbours

  return (
    <nav
      aria-label={t('projects.detail.pager')}
      className="grid gap-4 sm:grid-cols-2"
    >
      {previous && (
        <PagerLink
          project={previous}
          number={number - 1}
          total={total}
          direction="previous"
        />
      )}
      {next && (
        <PagerLink
          project={next}
          number={number + 1}
          total={total}
          direction="next"
        />
      )}
    </nav>
  )
}
