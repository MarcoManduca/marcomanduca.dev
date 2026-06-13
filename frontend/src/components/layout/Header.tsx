import { Link } from 'react-router-dom'

import { LanguageSwitcher } from './LanguageSwitcher'
import { NavBar } from './NavBar'

export const Header = () => (
  <header className="sticky top-0 z-40 border-b border-edge bg-background/90 backdrop-blur">
    <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
      <Link
        to="/"
        className="font-mono text-sm font-semibold text-heading hover:text-accent-hover"
      >
        marcomanduca<span className="text-accent">.dev</span>
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <NavBar />
        <LanguageSwitcher />
      </div>
    </div>
  </header>
)
