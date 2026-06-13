import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router-dom'

import { cn } from '@/utils/cn'

const NAV_ITEMS = [
  { to: '/', key: 'nav.home' },
  { to: '/about-me', key: 'nav.aboutMe' },
  { to: '/projects', key: 'nav.projects' },
  { to: '/learning', key: 'nav.learning' },
  { to: '/cv', key: 'nav.cv' },
  { to: '/contacts', key: 'nav.contacts' },
] as const

export const NavBar = () => {
  const { t } = useTranslation()

  return (
    <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
      {NAV_ITEMS.map(({ to, key }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-surface text-accent-hover'
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
