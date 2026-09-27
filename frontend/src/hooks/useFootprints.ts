import { useCallback, useEffect, useRef, useState } from 'react'

import type { FootSide, Footprint, Point } from '@/types'
import {
  STRIDE,
  distance,
  footprintAt,
  footprintSpan,
} from '@/utils/footprintGeometry'
import { isFloor, isFloorAt } from '@/utils/isFloor'
import { prefersReducedMotion } from '@/utils/prefersReducedMotion'

/** Prints on screen at once; the oldest goes first. */
export const MAX_FOOTPRINTS = 14

/**
 * Footprints trailing the mouse: every `STRIDE` pixels of travel the next
 * foot lands, if the pointer and the whole print, toe to heel, are on the
 * empty background (`isFloor`), so no print ever slips under a card. Prints
 * are placed in the pixels of the layer behind `layerRef`, so they stay put
 * on the page when it scrolls. Touch and pen never walk, and nothing walks
 * under reduced motion.
 */
export const useFootprints = () => {
  const layerRef = useRef<HTMLDivElement>(null)
  const [prints, setPrints] = useState<Footprint[]>([])

  useEffect(() => {
    if (prefersReducedMotion()) return
    let last: Point | null = null
    let side: FootSide = 'left'
    let id = 0

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const point = { x: event.clientX, y: event.clientY }
      if (last && distance(last, point) < STRIDE) return
      const from = last
      last = point
      if (!from) return
      // The feet keep in step even where a print does not show.
      const foot = side
      side = side === 'left' ? 'right' : 'left'
      const layer = layerRef.current
      if (!layer || !isFloor(event.target)) return
      const at = footprintAt(from, point, foot)
      if (!footprintSpan(at).every(isFloorAt)) return

      const box = layer.getBoundingClientRect()
      const print = {
        ...at,
        id: ++id,
        side: foot,
        x: at.x - box.left,
        y: at.y - box.top,
      }
      setPrints((current) => [...current.slice(1 - MAX_FOOTPRINTS), print])
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const remove = useCallback(
    (id: number) =>
      setPrints((current) => current.filter((print) => print.id !== id)),
    [],
  )

  return { layerRef, prints, remove }
}
