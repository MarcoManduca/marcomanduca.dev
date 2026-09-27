import { useEffect, useState } from 'react'

import { useHashTarget } from './useHashTarget'

/** Height of the reading line, as a share of the viewport. */
export const READING_LINE = 0.35

/**
 * Id of the element the reader is looking at: the last of `ids` whose top
 * has crossed a line at 35% of the viewport, `null` above the first one.
 *
 * Arriving on `#id` (e.g. from a home quest) selects that element until the
 * reader scrolls, even when the page ends before it can reach the line.
 */
export const useScrollSpy = (ids: string[]): string | null => {
  const hashTarget = useHashTarget()
  const [active, setActive] = useState(
    ids.includes(hashTarget) ? hashTarget : null,
  )
  const idsKey = ids.join(' ')

  useEffect(() => {
    const spied = idsKey.split(' ')
    const elements = spied
      .map((id) => document.getElementById(id))
      .filter((element) => element !== null)
    const landingY = window.scrollY
    let landed = spied.includes(hashTarget)

    const update = () => {
      // The arrival jump (or none, at the end of the page) keeps the target.
      if (landed && window.scrollY === landingY) return
      landed = false
      const line = window.innerHeight * READING_LINE
      const crossed = elements.filter(
        (element) => element.getBoundingClientRect().top <= line,
      )
      setActive(crossed.at(-1)?.id ?? null)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [idsKey, hashTarget])

  return active
}
