import { useEffect } from 'react'

import { useLocation } from 'react-router'

/**
 * Reset the scroll position on route changes, like a full page load would.
 *
 * When the URL carries a hash (e.g. `/about-me#skills`) the matching element
 * is scrolled into view instead of jumping to the top.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) {
      target.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
    // Only a pathname change is a new page; hash-only changes are in-page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}
