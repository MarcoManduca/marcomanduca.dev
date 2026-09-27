import type { Stat } from '@/types'
import {
  RADAR_BOX,
  RADAR_CENTER,
  radarLabel,
  radarPoint,
  radarPolygon,
  type RadarPoint,
} from '@/utils/radarGeometry'

/** Level rings, as shares of the maximum level. */
const RINGS = [0.25, 0.5, 0.75, 1]

interface RadarChartProps {
  stats: Stat[]
  /** Each stat's point, at its level along its axis. */
  points: RadarPoint[]
  active: number | null
}

/** The radar drawing: level rings, axes, the levels polygon and axis labels. */
export const RadarChart = ({ stats, points, active }: RadarChartProps) => {
  const count = stats.length

  return (
    <svg
      viewBox={`0 0 ${RADAR_BOX.width} ${RADAR_BOX.height}`}
      aria-hidden="true"
      className="h-full w-full overflow-visible"
    >
      {RINGS.map((share) => (
        <polygon
          key={share}
          points={radarPolygon(stats.map(() => share))}
          strokeWidth={1}
          className="fill-none stroke-edge"
        />
      ))}
      {stats.map((stat, index) => {
        const end = radarPoint(index, count, 1)
        return (
          <line
            key={stat.group}
            x1={RADAR_CENTER.x}
            y1={RADAR_CENTER.y}
            x2={end.x}
            y2={end.y}
            strokeWidth={1}
            className={active === index ? 'stroke-muted' : 'stroke-edge'}
          />
        )
      })}
      <polygon
        points={points.map(({ x, y }) => `${x},${y}`).join(' ')}
        strokeWidth={2}
        strokeLinejoin="round"
        className="fill-highlight/[0.12] stroke-highlight"
      />
      {points.map((point, index) => (
        <circle
          key={stats[index].group}
          cx={point.x}
          cy={point.y}
          r={active === index ? 7 : 5}
          strokeWidth={2}
          className="fill-highlight stroke-surface"
        />
      ))}
      {stats.map((stat, index) => {
        const label = radarLabel(index, count)
        return (
          <text
            key={stat.group}
            x={label.x}
            y={label.y}
            textAnchor={label.anchor}
            className="fill-body font-display text-[13px] font-bold uppercase tracking-[0.06em]"
          >
            {stat.axis}
          </text>
        )
      })}
    </svg>
  )
}
