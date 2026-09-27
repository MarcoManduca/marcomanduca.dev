import type { Stat } from '@/types'
import { cn } from '@/utils/cn'
import { MAX_STAT_LEVEL } from '@/utils/statLevels'

interface StatLevelListProps {
  stats: Stat[]
  active: number | null
  onShow: (index: number) => void
  onHide: () => void
}

/**
 * Level of each stat as a row of pips, beside the radar from `lg` (phones
 * keep only the chart). Hovering a row lights its point on the radar, whose
 * tooltip lists the group's tools.
 */
export const StatLevelList = ({
  stats,
  active,
  onShow,
  onHide,
}: StatLevelListProps) => (
  <ul className="hidden gap-2.5 lg:grid lg:grid-cols-2">
    {stats.map((stat, index) => (
      <li
        key={stat.group}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') onShow(index)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') onHide()
        }}
        className={cn(
          'flex min-w-0 flex-col gap-2 rounded-xl px-3.5 py-3 transition-colors',
          active === index ? 'bg-raised' : 'bg-background/55',
        )}
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-display text-[17px] font-bold uppercase text-heading">
            {stat.name}
          </span>
          <span className="font-display text-[17px] font-extrabold text-heading">
            {stat.level}
            <span className="text-[13px] font-bold text-muted">
              /{MAX_STAT_LEVEL}
            </span>
          </span>
        </span>
        <span aria-hidden="true" className="flex gap-[3px]">
          {Array.from({ length: MAX_STAT_LEVEL }, (_, pip) => (
            <span
              key={pip}
              className={cn(
                'h-1.5 flex-1 rounded-full',
                pip < stat.level ? 'bg-highlight' : 'bg-edge',
              )}
            />
          ))}
        </span>
      </li>
    ))}
  </ul>
)
