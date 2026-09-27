import { useCallback, useRef, useState, type TouchEvent } from 'react'

import { unlock } from '@/store/gameSlice'
import { useAppDispatch } from '@/store/hooks'

/** Horizontal travel (px) that turns a touch into a swipe. */
const SWIPE_THRESHOLD = 40

/**
 * Flip state of the character card, toggled by a tap/click or a horizontal
 * swipe. The first flip unlocks the "curious" figurine.
 */
export const useCardFlip = () => {
  const dispatch = useAppDispatch()
  const [flipped, setFlipped] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const flip = useCallback(() => {
    setFlipped((value) => !value)
    dispatch(unlock('curious'))
  }, [dispatch])

  const onTouchStart = ({ touches }: TouchEvent) => {
    touchStart.current = { x: touches[0].clientX, y: touches[0].clientY }
  }

  const onTouchEnd = ({ changedTouches }: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const dx = changedTouches[0].clientX - start.x
    const dy = changedTouches[0].clientY - start.y
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) flip()
  }

  return { flipped, flip, swipeHandlers: { onTouchStart, onTouchEnd } }
}
