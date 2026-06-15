import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

/**
 * OIDC redirect target (the Cognito callback URL `/admin/callback`).
 *
 * react-oidc-context exchanges the authorization code automatically on mount;
 * a spinner is shown while that happens. On success the user is sent into the
 * admin area; on failure an error with a retry action is shown instead of
 * navigating, which would otherwise bounce back here and loop.
 */
export const AuthCallback = () => {
  const { t } = useTranslation()
  const { isLoading, error, signIn } = useAuth()

  if (isLoading) return <Spinner className="min-h-screen" />

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <h1 className="text-2xl font-bold text-heading">
          {t('auth.errorTitle')}
        </h1>
        <p className="text-muted">{t('auth.errorMessage')}</p>
        <Button onClick={signIn}>{t('auth.retry')}</Button>
      </div>
    )
  }

  return <Navigate to="/admin" replace />
}
