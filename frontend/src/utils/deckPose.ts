interface Pose {
  x: number
  y: number
  rotate: number
  scale: number
  brightness: number
}

/** Resting poses from the top card down; deeper cards wait behind the last. */
const POSES: readonly Pose[] = [
  { x: 0, y: 0, rotate: 0, scale: 1, brightness: 1 },
  { x: 24, y: 10, rotate: 4, scale: 0.95, brightness: 0.6 },
  { x: 46, y: 20, rotate: 8, scale: 0.9, brightness: 0.4 },
]

/** How far (px) the fanned cards stick out on the right and at the bottom. */
export const DECK_SPREAD = { x: 46, y: 26 } as const

const round = (value: number) => Math.round(value * 1000) / 1000
const lerp = (from: number, to: number, share: number) =>
  round(from + (to - from) * share)

/**
 * Transform and filter of the card `depth` places below the top (0). A
 * fractional depth blends two poses, so the cards below rise while the top
 * card is pulled away. Cards past the last pose are hidden behind it.
 */
export const deckPose = (depth: number) => {
  const last = POSES.length - 1
  const clamped = Math.min(Math.max(depth, 0), last)
  const from = POSES[Math.floor(clamped)]
  const to = POSES[Math.ceil(clamped)]
  const share = clamped - Math.floor(clamped)

  return {
    transform: `translate(${lerp(from.x, to.x, share)}px, ${lerp(from.y, to.y, share)}px) rotate(${lerp(from.rotate, to.rotate, share)}deg) scale(${lerp(from.scale, to.scale, share)})`,
    filter: `brightness(${lerp(from.brightness, to.brightness, share)})`,
    hidden: depth > last,
  }
}

/** Transform of the top card dragged `dx` px: it follows and tilts. */
export const dragPose = (dx: number) =>
  `translate(${round(dx)}px, ${round(Math.abs(dx) * 0.05)}px) rotate(${round(dx / 18)}deg)`

/** Transform of the top card thrown off to the right (1) or left (-1). */
export const throwPose = (direction: 1 | -1) =>
  `translate(${direction * 640}px, 40px) rotate(${direction * 24}deg)`
