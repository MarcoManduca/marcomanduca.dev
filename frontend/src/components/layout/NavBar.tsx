import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'

import { useLearningOpen } from '@/hooks/useLearningOpen'
import { cn } from '@/utils/cn'

const LEARNING = '/learning'

// Home is reached through the brand link in the header.
const NAV_ITEMS = [
  { to: '/about-me', key: 'nav.aboutMe' },
  { to: '/projects', key: 'nav.projects' },
  { to: LEARNING, key: 'nav.learning' },
  { to: '/contacts', key: 'nav.contacts' },
] as const

interface NavBarProps {
  orientation?: 'horizontal' | 'vertical'
  /** Accessible name of the landmark (defaults to the main navigation). */
  label?: string
  onNavigate?: () => void
}

export const NavBar = ({
  orientation = 'horizontal',
  label,
  onNavigate,
}: NavBarProps) => {
  const { t } = useTranslation()
  const { isOpen: learningOpen } = useLearningOpen()
  const vertical = orientation === 'vertical'
  // Learning joins the menu once it has a published article.
  const items = NAV_ITEMS.filter(({ to }) => to !== LEARNING || learningOpen)

  return (
    <nav
      aria-label={label ?? t('nav.mainLabel')}
      className={cn(
        'flex gap-1 font-display text-base font-bold uppercase tracking-wider',
        vertical ? 'w-full flex-col' : 'flex-wrap items-center',
      )}
    >
      {items.map(({ to, key }) => (
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
