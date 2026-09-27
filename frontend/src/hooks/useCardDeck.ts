import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react'

import { prefersReducedMotion } from '@/utils/prefersReducedMotion'

/** Drag (px) past which the top card is thrown to the bottom of the deck. */
export const THROW_DISTANCE = 90
/** Duration (ms) of the throw before the card lands at the bottom. */
export const THROW_MS = 260
/** Travel (px) before a press counts as a drag rather than a tap or click. */
const DRAG_SLOP = 6

type Direction = 1 | -1

/**
 * State of a deck of `count` cards flipped through by dragging the top card
 * (mouse, touch or pen) or with `next` / `previous`. A drag past
 * `THROW_DISTANCE` throws the card off the side it was dragged to; it then
 * goes to the bottom and the one below comes to the top. A shorter drag lets
 * the card settle back. Reduced motion skips the throw. The click that ends a
 * drag is swallowed, so dragging never follows a link on the card.
 */
export const useCardDeck = (count: number) => {
  const [top, setTop] = useState(0)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [thrown, setThrown] = useState<Direction | null>(null)
  const startX = useRef<number | null>(null)
  const dragged = useRef(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const current = count > 0 ? top % count : 0

  const next = useCallback(
    (direction: Direction = 1) => {
      if (count < 2 || thrown) return
      const land = () => setTop((value) => (value + 1) % count)
      if (prefersReducedMotion()) return land()
      setThrown(direction)
      timer.current = window.setTimeout(() => {
        setThrown(null)
        land()
      }, THROW_MS)
    },
    [count, thrown],
  )

  const previous = useCallback(() => {
    if (count < 2 || thrown) return
    setTop((value) => (value - 1 + count) % count)
  }, [count, thrown])

  const endDrag = () => {
    startX.current = null
    setDragging(false)
    setDragX(0)
  }

  const dragHandlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (count < 2 || thrown || event.button !== 0) return
      startX.current = event.clientX
      dragged.current = false
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (startX.current === null) return
      const dx = event.clientX - startX.current
      if (!dragged.current) {
        if (Math.abs(dx) < DRAG_SLOP) return
        dragged.current = true
        setDragging(true)
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }
      setDragX(dx)
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      if (startX.current === null) return
      const dx = event.clientX - startX.current
      endDrag()
      if (dragged.current && Math.abs(dx) >= THROW_DISTANCE) {
        next(dx > 0 ? 1 : -1)
      }
    },
    // The browser took over the gesture (e.g. to scroll): settle back.
    onPointerCancel: endDrag,
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (!dragged.current) return
      dragged.current = false
      event.preventDefault()
      event.stopPropagation()
    },
  }

  return {
    top: current,
    dragX,
    dragging,
    thrown,
    next,
    previous,
    dragHandlers,
  }
}
