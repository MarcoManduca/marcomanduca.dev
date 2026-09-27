import { useEffect, useRef } from 'react'

import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router'

import { AuthError } from '@/components/admin/AuthError'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

/**
 * Guard for /admin routes: requires an authenticated user that belongs to
 * the Cognito "Administrators" group. Unauthenticated visitors are
 * redirected once to the Cognito hosted UI (carrying the requested path so
 * the callback can bring them back); if sign-in failed, an error with a
 * retry action is shown instead of redirecting again. Authenticated
 * non-admins see a forbidden message.
 */
export const ProtectedRoute = () => {
  const { t } = useTranslation()
  const { pathname, search, hash } = useLocation()
  const { isLoading, isAuthenticated, isAdmin, error, signIn } = useAuth()
  const redirectAttempted = useRef(false)
  const returnTo = `${pathname}${search}${hash}`

  useEffect(() => {
    if (isLoading || isAuthenticated || error || redirectAttempted.current) {
      return
    }
    redirectAttempted.current = true
    signIn(returnTo)
  }, [isLoading, isAuthenticated, error, signIn, returnTo])

  if (isLoading) return <Spinner className="min-h-screen" />

  if (!isAuthenticated) {
    if (error) return <AuthError onRetry={() => signIn(returnTo)} />
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
