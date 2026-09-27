import { useEffect } from 'react'

import { useLocation } from 'react-router'

import { whenElementAppears } from '@/utils/whenElementAppears'

/** How long a hash target may take to render (lazy page + API data). */
const HASH_TARGET_WAIT_MS = 5000
/** Once the reader scrolls or types, a late jump would only get in the way. */
const READER_EVENTS = ['wheel', 'touchstart', 'keydown'] as const

/**
 * Reset the scroll position on route changes, like a full page load would.
 *
 * When the URL carries a hash (e.g. `/projects/deep-layers#lab`) the matching
 * element is scrolled into view instead, also when it only renders after the
 * lazy page chunk and its data arrive.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const id = hash.slice(1)
    if (!id || !document.getElementById(id)) window.scrollTo(0, 0)
    if (!id) return

    const cancel = whenElementAppears(
      id,
      (target) => target.scrollIntoView(),
      HASH_TARGET_WAIT_MS,
    )
    READER_EVENTS.forEach((type) =>
      window.addEventListener(type, cancel, { once: true, passive: true }),
    )
    return () => {
      cancel()
      READER_EVENTS.forEach((type) => window.removeEventListener(type, cancel))
    }
    // Only a pathname change is a new page; hash-only changes are in-page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
