import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'

// Home is reached through the brand link in the header.
const NAV_ITEMS = [
  { to: '/about-me', key: 'nav.aboutMe' },
  { to: '/projects', key: 'nav.projects' },
  { to: '/learning', key: 'nav.learning' },
  { to: '/contacts', key: 'nav.contacts' },
] as const

interface NavBarProps {
  orientation?: 'horizontal' | 'vertical'
  label?: string
  onNavigate?: () => void
}

export const NavBar = ({
  orientation = 'horizontal',
  label = 'Main',
  onNavigate,
}: NavBarProps) => {
  const { t } = useTranslation()
  const vertical = orientation === 'vertical'

  return (
    <nav
      aria-label={label}
      className={cn(
        'flex gap-1 font-display text-base font-bold uppercase tracking-wider',
        vertical ? 'w-full flex-col' : 'flex-wrap items-center',
      )}
    >
      {NAV_ITEMS.map(({ to, key }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 transition-colors',
              vertical && 'w-full',
              isActive
                ? 'bg-highlight text-background'
                : 'text-heading hover:text-highlight',
            )
          }
        >
          {t(key)}
        </NavLink>
      ))}
    </nav>
  )
}
