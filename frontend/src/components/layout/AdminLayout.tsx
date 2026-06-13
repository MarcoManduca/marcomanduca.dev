import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

const ADMIN_NAV = [
  { to: '/admin', key: 'admin.nav.dashboard', end: true },
  { to: '/admin/projects', key: 'admin.nav.projects', end: false },
  { to: '/admin/learning', key: 'admin.nav.learning', end: false },
  { to: '/admin/media', key: 'admin.nav.media', end: false },
] as const

export const AdminLayout = () => {
  const { t } = useTranslation()
  const { userName, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-edge bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="font-mono text-sm font-semibold text-heading">
            {t('admin.title')}
          </span>
          <nav aria-label="Admin" className="flex flex-wrap gap-1">
            {ADMIN_NAV.map(({ to, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-raised text-accent-hover'
                      : 'text-body hover:text-heading',
                  )
                }
              >
                {t(key)}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {userName && <span className="text-muted">{userName}</span>}
            <Link to="/" className="text-body hover:text-accent-hover">
              {t('admin.backToSite')}
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="text-body hover:text-accent-hover"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
