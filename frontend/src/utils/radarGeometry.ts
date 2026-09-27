/** A point in the radar's SVG user units. */
export interface RadarPoint {
  x: number
  y: number
}

/** Drawing box (SVG user units); the chart scales with its container. */
export const RADAR_BOX = { width: 360, height: 300 } as const
export const RADAR_CENTER: RadarPoint = { x: 180, y: 150 }
const RADIUS = 105
/** Gap between the outer ring and an axis label. */
const LABEL_GAP = 10

const round = (value: number) => Math.round(value * 10) / 10

/** Unit vector of axis `index` of `count`, clockwise from the top. */
const axisDirection = (index: number, count: number) => {
  const angle = (2 * Math.PI * index) / count
  return { dx: Math.sin(angle), dy: -Math.cos(angle) }
}

/** Point at `share` (0–1) of the radius along axis `index` of `count`. */
export const radarPoint = (
  index: number,
  count: number,
  share: number,
): RadarPoint => {
  const { dx, dy } = axisDirection(index, count)
  return {
    x: round(RADAR_CENTER.x + dx * RADIUS * share),
    y: round(RADAR_CENTER.y + dy * RADIUS * share),
  }
}

/** SVG `points` of the polygon crossing each axis at its share. */
export const radarPolygon = (shares: readonly number[]): string =>
  shares
    .map((share, index) => {
      const { x, y } = radarPoint(index, shares.length, share)
      return `${x},${y}`
    })
    .join(' ')

/** Position of axis `index`'s label, just outside the outer ring. */
export const radarLabel = (index: number, count: number) => {
  const { dx, dy } = axisDirection(index, count)
  const anchor: 'start' | 'middle' | 'end' =
    Math.abs(dx) < 0.01 ? 'middle' : dx > 0 ? 'start' : 'end'
  return {
    x: round(RADAR_CENTER.x + dx * (RADIUS + LABEL_GAP)),
    // Text grows up from its baseline: nudge it down to centre it on the axis.
    y: round(RADAR_CENTER.y + dy * (RADIUS + LABEL_GAP + 2) + 4),
    anchor,
  }
}
