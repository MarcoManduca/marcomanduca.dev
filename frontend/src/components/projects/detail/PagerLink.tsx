import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { AreaChips } from '@/components/projects/AreaChips'
import { useLanguage } from '@/hooks/useLanguage'
import type { ProjectSummary } from '@/types'
import { cn } from '@/utils/cn'
import { twoDigits } from '@/utils/twoDigits'

interface PagerLinkProps {
  project: ProjectSummary
  number: number
  total: number
  direction: 'previous' | 'next'
}

/** The side quest before or after this one. */
export const PagerLink = ({
  project,
  number,
  total,
  direction,
}: PagerLinkProps) => {
  const { t } = useTranslation()
  const { localize } = useLanguage()
  const isNext = direction === 'next'

  return (
    <Link
      to={`/projects/${project.slug}`}
      className={cn(
        'flex items-center gap-4 rounded-2xl bg-surface px-6 py-5 text-heading transition-colors hover:bg-raised',
        isNext && 'flex-row-reverse text-right sm:col-start-2',
      )}
    >
      <span aria-hidden="true" className="text-[22px] text-muted">
        {isNext ? '→' : '←'}
      </span>
      <span className={cn('flex flex-col gap-1.5', isNext && 'items-end')}>
        <span className="sr-only">{t(`projects.detail.${direction}`)}</span>
        <span className="flex flex-wrap items-center gap-2.5 font-display text-[13px] font-bold tracking-[0.08em] text-muted">
          {t('home.sideQuests.number', {
            index: twoDigits(number),
            total: twoDigits(total),
          })}
          <AreaChips
            areas={project.areas}
            className={cn(isNext && 'justify-end')}
          />
        </span>
        <span className="font-display text-2xl font-extrabold uppercase leading-tight">
          {localize(project.title)}
        </span>
      </span>
    </Link>
  )
}
