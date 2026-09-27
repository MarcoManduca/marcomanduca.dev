import { useId, type PointerEvent } from 'react'

import { useTranslation } from 'react-i18next'

import type { Stat } from '@/types'
import { RADAR_BOX, radarPoint } from '@/utils/radarGeometry'
import { MAX_STAT_LEVEL } from '@/utils/statLevels'

import { RadarChart } from './RadarChart'
import { StatTooltip } from './StatTooltip'

const isMouse = (event: PointerEvent) => event.pointerType === 'mouse'

interface StatsRadarProps {
  stats: Stat[]
  active: number | null
  onShow: (index: number) => void
  onHide: () => void
  onToggle: (index: number) => void
}

/**
 * Radar of the stats. Each point is a button that shows its tooltip on
 * hover or focus, and toggles it on a tap (touch has no hover).
 */
export const StatsRadar = ({
  stats,
  active,
  onShow,
  onHide,
  onToggle,
}: StatsRadarProps) => {
  const { t } = useTranslation()
  const tooltipId = useId()
  const points = stats.map((stat, index) =>
    radarPoint(index, stats.length, stat.level / MAX_STAT_LEVEL),
  )

  return (
    <div className="relative mx-auto aspect-[6/5] w-full max-w-[360px]">
      <RadarChart stats={stats} points={points} active={active} />
      {points.map((point, index) => (
        <button
          key={stats[index].group}
          type="button"
          aria-label={t('home.stats.point', {
            name: stats[index].name,
            level: stats[index].level,
            max: MAX_STAT_LEVEL,
          })}
          aria-describedby={active === index ? tooltipId : undefined}
          onPointerEnter={(event) => {
            if (isMouse(event)) onShow(index)
          }}
          onPointerLeave={(event) => {
            if (isMouse(event)) onHide()
          }}
          onPointerDown={(event) => {
            if (!isMouse(event)) onToggle(index)
          }}
          onFocus={() => onShow(index)}
          onBlur={onHide}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onHide()
          }}
          style={{
            left: `${(point.x / RADAR_BOX.width) * 100}%`,
            top: `${(point.y / RADAR_BOX.height) * 100}%`,
          }}
          className="absolute h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-highlight"
        />
      ))}
      {active !== null && (
        <StatTooltip
          id={tooltipId}
          stat={stats[active]}
          point={points[active]}
        />
      )}
    </div>
  )
}
