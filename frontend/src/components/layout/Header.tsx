import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useMobileMenu } from '@/hooks/useMobileMenu'

import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { MenuToggleIcon } from './MenuToggleIcon'
import { NavBar } from './NavBar'

export const Header = () => {
  const { t } = useTranslation()
  const { open, toggle, close, containerRef, menuRef, toggleRef } =
    useMobileMenu()

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-40 border-b border-edge bg-background/90 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-2 font-mono text-sm font-semibold text-heading hover:text-accent-hover"
        >
          <Logo className="h-7 w-7" />
          <span>
            marcomanduca<span className="text-accent">.dev</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-4 md:flex">
          <NavBar />
          <LanguageSwitcher />
        </div>

        {/* Mobile menu toggle: hamburger when closed, X when open */}
        <button
          ref={toggleRef}
          type="button"
          aria-label={t(open ? 'nav.closeMenu' : 'nav.openMenu')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={toggle}
          className="text-body transition-colors hover:text-heading md:hidden"
        >
          <MenuToggleIcon open={open} />
        </button>
      </div>

      {/* Mobile menu panel: overlays the page instead of pushing content down */}
      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex flex-col items-start gap-4 border-b border-edge bg-background px-4 py-4 shadow-lg md:hidden"
        >
          <NavBar orientation="vertical" label="Mobile" onNavigate={close} />
          <LanguageSwitcher />
        </div>
      )}
    </header>
  )
}
