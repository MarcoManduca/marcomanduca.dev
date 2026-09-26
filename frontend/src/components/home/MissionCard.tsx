import { Link } from 'react-router-dom'

import type { Mission, MissionStatus } from '@/types'
import { cn } from '@/utils/cn'

const STATUS_CLASSES: Record<MissionStatus, string> = {
  active: 'text-warm',
  done: 'text-accent',
  new: 'text-highlight',
}

type MissionCardProps = Omit<Mission, 'key'>

export const MissionCard = ({
  to,
  kind,
  status,
  title,
  meta,
  featured = false,
}: MissionCardProps) => (
  <Link
    to={to}
    className={cn(
      'group flex min-h-[150px] flex-col gap-2.5 rounded-2xl border-2 bg-surface p-5 transition motion-safe:hover:-translate-y-1',
      featured ? 'border-warm' : 'border-edge hover:border-warm/70',
    )}
  >
    <span
      className={cn(
        'font-display text-sm font-bold uppercase tracking-widest',
        STATUS_CLASSES[status],
      )}
    >
      {kind}
    </span>
    <span className="font-display text-2xl font-bold leading-tight text-heading group-hover:text-highlight">
      {title}
    </span>
    <span className="mt-auto text-[15px] text-muted">{meta}</span>
  </Link>
)
