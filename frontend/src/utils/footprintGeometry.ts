import type { FootSide, Placement, Point } from '@/types'

/** Drawn size of a print (px), toes up. */
export const FOOTPRINT_SIZE = { width: 12, height: 24 } as const
/** Mouse travel between two prints, in pixels. */
export const STRIDE = 34
/** How far each print sits from the path, to the walker's left or right. */
const LATERAL = 6
/** From the centre to just short of the toes or the heel. */
const REACH = FOOTPRINT_SIZE.height / 2 - 2

const round = (value: number) => Math.round(value * 10) / 10

/** Straight-line distance between two points. */
export const distance = (from: Point, to: Point): number =>
  Math.hypot(to.x - from.x, to.y - from.y)

/**
 * Where the `side` foot lands at `to`, walking from `from`: beside the path,
 * toes along the heading. Screen y grows downwards, so the walker's left is
 * the heading turned a quarter anticlockwise.
 */
export const footprintAt = (
  from: Point,
  to: Point,
  side: FootSide,
): Placement => {
  const heading = Math.atan2(to.y - from.y, to.x - from.x)
  const offset = side === 'left' ? LATERAL : -LATERAL
  return {
    x: round(to.x + Math.sin(heading) * offset),
    y: round(to.y - Math.cos(heading) * offset),
    rotate: round((heading * 180) / Math.PI + 90),
  }
}

/** Toe, centre and heel of a print: the ground must be free under all three. */
export const footprintSpan = ({ x, y, rotate }: Placement): Point[] => {
  const angle = (rotate * Math.PI) / 180
  const dx = Math.sin(angle) * REACH
  const dy = -Math.cos(angle) * REACH
  return [
    { x: round(x + dx), y: round(y + dy) },
    { x, y },
    { x: round(x - dx), y: round(y - dy) },
  ]
}
