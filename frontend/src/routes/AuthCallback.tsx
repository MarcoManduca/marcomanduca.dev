import { Navigate } from 'react-router'

import { AuthError } from '@/components/admin/AuthError'
import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

const ADMIN_HOME = '/admin'
const ADMIN_PATH = /^\/admin(?:[/?#]|$)/

/**
 * Accept only a same-origin, relative path inside the admin area (never the
 * callback itself) to avoid open redirects and loops; fall back to /admin.
 */
const toSafeAdminPath = (path: string | null | undefined): string => {
  if (!path || !ADMIN_PATH.test(path) || path.includes('\\')) return ADMIN_HOME
  const url = new URL(path, window.location.origin)
  if (url.origin !== window.location.origin) return ADMIN_HOME
  if (url.pathname.startsWith('/admin/callback')) return ADMIN_HOME
  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * OIDC redirect target (the Cognito callback URL `/admin/callback`).
 *
 * react-oidc-context exchanges the authorization code automatically on mount;
 * a spinner is shown while that happens. On success the user is sent back to
 * the admin page requested before signing in; on failure an error with a
 * retry action is shown instead of navigating, which would otherwise bounce
 * back here and loop.
 */
export const AuthCallback = () => {
  const { isLoading, error, returnTo, signIn } = useAuth()

  if (isLoading) return <Spinner className="min-h-screen" />

  if (error) return <AuthError onRetry={() => signIn()} />

  return <Navigate to={toSafeAdminPath(returnTo)} replace />
}
