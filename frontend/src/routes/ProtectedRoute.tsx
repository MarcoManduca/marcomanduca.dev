import { useEffect } from 'react'

import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

/**
 * Guard for /admin routes: requires an authenticated user that belongs to
 * the Cognito "Administrators" group. Unauthenticated visitors are
 * redirected to the Cognito hosted UI; authenticated non-admins see a
 * forbidden message.
 */
export const ProtectedRoute = () => {
  const { t } = useTranslation()
  const { isLoading, isAuthenticated, isAdmin, signIn } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) signIn()
  }, [isLoading, isAuthenticated, signIn])

  if (isLoading) return <Spinner className="min-h-screen" />

  if (!isAuthenticated) {
    return (
      <p role="status" className="py-20 text-center text-muted">
        {t('auth.redirecting')}
      </p>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-2xl font-bold text-heading">
          {t('auth.forbiddenTitle')}
        </h1>
        <p className="text-muted">{t('auth.forbiddenMessage')}</p>
      </div>
    )
  }

  return <Outlet />
}
