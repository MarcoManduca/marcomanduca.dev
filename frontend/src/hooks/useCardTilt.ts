import { useEffect, useRef, type PointerEvent } from 'react'

/** Lean (degrees) with the pointer on an edge of the card. */
const MAX_TILT = 8

/**
 * Foil sheen shift with the pointer on an edge, in % of the sheen layer: it is
 * twice the card, so 15% moves the band by 30% of the card.
 */
const FOIL_SWEEP = 15

/**
 * Share of the remaining way to the pointer covered in a 60 fps frame: the
 * card and its foil cover 90% of it in about 170 ms, at any refresh rate.
 */
const FOLLOW = 0.2
const FRAME_MS = 1000 / 60

/** Distance (pointer offset units) under which the lean lands on the pointer. */
const SNAP = 0.001

/** Pointer offset from the centre of the card, from -1 to 1 on each axis. */
interface Offset {
  x: number
  y: number
}

interface Motion {
  target: Offset
  current: Offset
  frame: number | null
  lastTime: number | null
}

/**
 * Pointer-follow tilt of the character card: with a mouse, the card leans
 * toward the pointer (the side under it comes forward) and the foil sheen
 * slides after it; both settle back when the pointer leaves. One animation
 * frame loop eases the lean toward the pointer and writes the `--tilt-x` /
 * `--tilt-y` and `--foil-x` / `--foil-y` custom properties of `tiltRef`, so the
 * card never re-renders and no CSS transition restarts on every pointer move
 * (Safari stutters when it does). Touch and pen are ignored: there the card
 * swipes.
 */
export const useCardTilt = <T extends HTMLElement>() => {
  const tiltRef = useRef<T>(null)
  const motion = useRef<Motion>({
    target: { x: 0, y: 0 },
    current: { x: 0, y: 0 },
    frame: null,
    lastTime: null,
  })

  useEffect(() => {
    const state = motion.current
    return () => {
      if (state.frame !== null) cancelAnimationFrame(state.frame)
    }
  }, [])

  const write = ({ x, y }: Offset) => {
    const style = tiltRef.current?.style
    style?.setProperty('--tilt-x', `${y * MAX_TILT}deg`)
    style?.setProperty('--tilt-y', `${-x * MAX_TILT}deg`)
    style?.setProperty('--foil-x', `${x * FOIL_SWEEP}%`)
    style?.setProperty('--foil-y', `${y * FOIL_SWEEP}%`)
  }

  const step = (time: number) => {
    const state = motion.current
    const { target, current } = state
    const elapsed = state.lastTime === null ? FRAME_MS : time - state.lastTime
    const share = 1 - (1 - FOLLOW) ** (elapsed / FRAME_MS)
    current.x += (target.x - current.x) * share
    current.y += (target.y - current.y) * share
    const landed =
      Math.abs(target.x - current.x) < SNAP &&
      Math.abs(target.y - current.y) < SNAP
    if (landed) state.current = { ...target }
    write(state.current)
    state.lastTime = landed ? null : time
    state.frame = landed ? null : requestAnimationFrame(step)
  }

  const follow = (x: number, y: number) => {
    const state = motion.current
    state.target = { x, y }
    state.frame ??= requestAnimationFrame(step)
  }

  const onPointerMove = ({
    pointerType,
    clientX,
    clientY,
    currentTarget,
  }: PointerEvent<HTMLElement>) => {
    if (pointerType !== 'mouse') return
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    const x = ((clientX - left) / width) * 2 - 1
    const y = ((clientY - top) / height) * 2 - 1
    follow(x, y)
  }

  const onPointerLeave = () => follow(0, 0)

  return { tiltRef, tiltHandlers: { onPointerMove, onPointerLeave } }
}
