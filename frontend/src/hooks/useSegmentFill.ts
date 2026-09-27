import { type RefObject, useEffect, useState } from 'react'

import { READING_LINE } from './useScrollSpy'

/** Clamped to 0–1 and rounded, so sub-pixel scrolls do not re-render. */
const toFill = (value: number) =>
  Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000

/**
 * Share (0–1) of a timeline segment the reader has scrolled through.
 *
 * The segment runs from an entry's dot to the next entry's dot, and fills as
 * the scroll-spy reading line travels from the top of `entry` to the top of
 * the next one: it reaches the next dot just as that entry becomes active.
 * `passed` fills it whole, for an entry above the active one that the line
 * never reached (arriving on a `#anchor` the page cannot scroll up to).
 */
export const useSegmentFill = (
  entry: RefObject<HTMLElement>,
  segment: RefObject<HTMLElement>,
  passed: boolean,
): number => {
  const [fill, setFill] = useState(0)

  useEffect(() => {
    const update = () => {
      const top = entry.current?.getBoundingClientRect().top
      const length = segment.current?.getBoundingClientRect().height
      if (top === undefined || !length) return
      const line = window.innerHeight * READING_LINE
      setFill(toFill((line - top) / length))
    }
    // Text reflows (a language switch, late fonts) move the entries too.
    const resize =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update)
    resize?.observe(document.documentElement)

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      resize?.disconnect()
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [entry, segment])

  return passed ? 1 : fill
}
