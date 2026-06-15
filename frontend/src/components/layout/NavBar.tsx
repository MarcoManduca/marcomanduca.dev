import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
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
        'flex gap-1',
        vertical ? 'w-full flex-col' : 'flex-wrap items-center',
      )}
    >
      {NAV_ITEMS.map(({ to, key }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              vertical && 'w-full',
              isActive
                ? 'bg-highlight/80 text-background'
                : 'text-body hover:text-heading',
            )
          }
        >
          {t(key)}
        </NavLink>
      ))}
    </nav>
  )
}
