import { useEffect, useRef } from 'react'

import { useLocation } from 'react-router'

/**
 * Move focus to the element `id` (the page's <main>) after in-app
 * navigation, like a full page load resets it: keyboard and screen-reader
 * users then start on the new page instead of a link that may be gone. Not
 * on first load (the browser handles it), not for hash links (ScrollToTop
 * brings the target into view), and without scrolling (ScrollToTop owns the
 * scroll position).
 */
export const useFocusOnNavigate = (id: string): void => {
  const { pathname, hash } = useLocation()
  const previousPathname = useRef(pathname)

  useEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    if (hash) return
    document.getElementById(id)?.focus({ preventScroll: true })
  }, [id, pathname, hash])
}
