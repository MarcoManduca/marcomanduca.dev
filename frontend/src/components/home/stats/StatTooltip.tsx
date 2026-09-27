import { useTranslation } from 'react-i18next'

import type { Stat } from '@/types'
import { RADAR_BOX, RADAR_CENTER, type RadarPoint } from '@/utils/radarGeometry'
import { MAX_STAT_LEVEL } from '@/utils/statLevels'

const WIDTH = '12.25rem'
/** Lowest top edge (SVG units) that keeps the tooltip inside the chart. */
const TOP_LIMIT = 200

interface StatTooltipProps {
  id: string
  stat: Stat
  point: RadarPoint
}

/** A stat's name, level and tools, beside its point on the radar. */
export const StatTooltip = ({ id, stat, point }: StatTooltipProps) => {
  const { t } = useTranslation()
  const x = (point.x / RADAR_BOX.width) * 100
  const top =
    (Math.min(Math.max(point.y - 40, 0), TOP_LIMIT) / RADAR_BOX.height) * 100
  // On the point's outer side, and never past the edge of the chart.
  const side =
    point.x > RADAR_CENTER.x + 1
      ? { right: `min(calc(${100 - x}% + 16px), calc(100% - ${WIDTH}))` }
      : { left: `min(calc(${x}% + 16px), calc(100% - ${WIDTH}))` }

  return (
    <div
      id={id}
      role="tooltip"
      style={{ ...side, top: `${top}%`, width: WIDTH }}
      className="pointer-events-none absolute z-10 flex flex-col gap-1 rounded-[10px] border border-edge bg-background px-3 py-2.5 shadow-xl shadow-black/30"
    >
      <span className="font-display text-[17px] font-bold uppercase text-heading">
        {stat.name}
      </span>
      <span className="font-display text-sm font-bold tracking-wide text-heading">
        {t('home.stats.level', { level: stat.level, max: MAX_STAT_LEVEL })}
      </span>
      <span className="text-[13px] leading-snug text-body">
        {stat.skills.join(' · ')}
      </span>
    </div>
  )
}
