import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks/useTheme'
import { unlock } from '@/store/gameSlice'
import { useAppDispatch } from '@/store/hooks'

const ICON_PROPS = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const SunIcon = () => (
  <svg {...ICON_PROPS}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

const MoonIcon = () => (
  <svg {...ICON_PROPS}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
)

/** Switches between the dark and light theme (and unlocks Eclipse). */
export const ThemeToggle = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    toggleTheme()
    dispatch(unlock('eclipse'))
  }

  return (
    <button
      type="button"
      aria-label={t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')}
      onClick={handleClick}
      className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-edge text-body transition-colors hover:border-highlight hover:text-highlight"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
