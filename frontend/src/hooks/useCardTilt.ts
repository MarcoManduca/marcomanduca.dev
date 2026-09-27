import { useRef, type PointerEvent } from 'react'

/** Lean (degrees) with the pointer on an edge of the card. */
const MAX_TILT = 8

/**
 * Pointer-follow tilt of the character card: with a mouse, the card leans
 * toward the pointer (the side under it comes forward) and settles back when
 * the pointer leaves. It writes the `--tilt-x` / `--tilt-y` custom properties
 * of `tiltRef`, so moving the pointer never re-renders the card. Touch and pen
 * are ignored: there the card swipes.
 */
export const useCardTilt = <T extends HTMLElement>() => {
  const tiltRef = useRef<T>(null)

  const setTilt = (x: number, y: number) => {
    tiltRef.current?.style.setProperty('--tilt-x', `${x}deg`)
    tiltRef.current?.style.setProperty('--tilt-y', `${y}deg`)
  }

  const onPointerMove = ({
    pointerType,
    clientX,
    clientY,
    currentTarget,
  }: PointerEvent<HTMLElement>) => {
    if (pointerType !== 'mouse') return
    const { left, top, width, height } = currentTarget.getBoundingClientRect()
    // Pointer offset from the centre, from -1 to 1 on each axis.
    const dx = ((clientX - left) / width) * 2 - 1
    const dy = ((clientY - top) / height) * 2 - 1
    setTilt(dy * MAX_TILT, -dx * MAX_TILT)
  }

  const onPointerLeave = () => setTilt(0, 0)

  return { tiltRef, tiltHandlers: { onPointerMove, onPointerLeave } }
}
