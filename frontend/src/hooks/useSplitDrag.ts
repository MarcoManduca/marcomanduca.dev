import { useRef, type PointerEvent, type RefObject } from 'react'

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

/**
 * Pointer handlers that move a comparison split (0–100) to wherever the
 * pointer presses or drags across `stageRef`. The divider's handle is the
 * keyboard and screen reader control.
 */
export const useSplitDrag = (
  stageRef: RefObject<HTMLElement | null>,
  onSplit: (split: number) => void,
) => {
  const dragging = useRef(false)

  const splitAt = (clientX: number) => {
    const box = stageRef.current?.getBoundingClientRect()
    if (!box || box.width === 0) return
    onSplit(Math.round(clampPercent(((clientX - box.left) / box.width) * 100)))
  }

  const stop = () => {
    dragging.current = false
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      dragging.current = true
      event.currentTarget.setPointerCapture?.(event.pointerId)
      splitAt(event.clientX)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (dragging.current) splitAt(event.clientX)
    },
    onPointerUp: stop,
    onPointerCancel: stop,
  }
}
