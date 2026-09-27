import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { useMobileMenu } from '@/hooks/useMobileMenu'

import { LanguageSwitcher } from './LanguageSwitcher'
import { Logo } from './Logo'
import { MenuToggleIcon } from './MenuToggleIcon'
import { NavBar } from './NavBar'
import { ThemeToggle } from './ThemeToggle'

export const Header = () => {
  const { t } = useTranslation()
  const { open, toggle, close, containerRef, menuRef, toggleRef } =
    useMobileMenu()

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-40 border-b border-edge/60 bg-background/85 backdrop-blur"
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-3 font-display text-xl font-extrabold uppercase tracking-wide text-heading hover:text-highlight"
        >
          <Logo className="h-7 w-9" />
          <span>Marco Manduca</span>
        </Link>

        {/* Desktop navigation and settings */}
        <div className="hidden lg:block">
          <NavBar />
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile menu toggle: hamburger when closed, X when open */}
        <button
          ref={toggleRef}
          type="button"
          aria-label={t(open ? 'nav.closeMenu' : 'nav.openMenu')}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={toggle}
          className="flex h-10 w-10 items-center justify-center text-body transition-colors hover:text-heading lg:hidden"
        >
          <MenuToggleIcon open={open} />
        </button>
      </div>

      {/* Mobile menu panel: overlays the page instead of pushing content down */}
      {open && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="absolute inset-x-0 top-full flex flex-col items-start gap-4 border-b border-edge bg-background px-4 py-4 shadow-lg lg:hidden"
        >
          <NavBar orientation="vertical" label="Mobile" onNavigate={close} />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  )
}
