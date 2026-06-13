import { Navigate } from 'react-router-dom'

import { Spinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'

/**
 * OIDC redirect target (the Cognito callback URL `/admin/callback`).
 *
 * react-oidc-context exchanges the authorization code automatically on mount;
 * a spinner is shown while that happens, then the user is sent into the admin
 * area, where ProtectedRoute enforces the admin-group check.
 */
export const AuthCallback = () => {
  const { isLoading } = useAuth()

  if (isLoading) return <Spinner className="min-h-screen" />

  return <Navigate to="/admin" replace />
}
