import { useCallback, useEffect, useRef, useState } from 'react'

import { useLocation } from 'react-router-dom'

/**
 * Open/close state and accessibility behaviour of a disclosure menu.
 *
 * - Escape closes the menu and returns focus to the toggle button.
 * - A click outside `containerRef` or a route change closes it.
 * - Opening moves focus to the first link inside `menuRef`.
 */
export const useMobileMenu = () => {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((value) => !value), [])

  useEffect(close, [pathname, close])

  useEffect(() => {
    if (!open) return

    menuRef.current?.querySelector<HTMLElement>('a[href]')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (!containerRef.current?.contains(target)) setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [open])

  return { open, toggle, close, containerRef, menuRef, toggleRef }
}
