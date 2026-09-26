import { Link } from 'react-router-dom'

import type { Quest } from '@/types'
import { cn } from '@/utils/cn'

import { QuestMedal } from './QuestMedal'

interface QuestCardProps {
  quest: Quest
  featured?: boolean
}

/** One quest as a row: domain medal, name, subtitle and year or arrow. */
export const QuestCard = ({
  quest: { kind, to, title, subtitle, year },
  featured = false,
}: QuestCardProps) => (
  <li>
    <Link
      to={to}
      className={cn(
        'group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 bg-surface px-4 py-3.5 transition-colors sm:gap-[18px] sm:px-5 sm:py-[18px]',
        featured ? 'border-warm' : 'border-edge hover:border-warm/70',
      )}
    >
      <QuestMedal kind={kind} completed={year !== undefined} />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="font-display text-xl font-bold leading-tight text-heading group-hover:text-highlight sm:text-[26px]">
          {title}
        </span>
        <span className="text-sm text-muted sm:text-[15px]">{subtitle}</span>
      </span>
      <span
        aria-hidden={year === undefined}
        className="font-display text-base font-bold text-muted"
      >
        {year ?? '→'}
      </span>
    </Link>
  </li>
)
