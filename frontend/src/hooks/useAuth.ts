import { useAuth as useOidcAuth } from 'react-oidc-context'

import { ADMIN_GROUP } from '@/utils/env'

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  userName: string | null
  signIn: () => void
  signOut: () => void
}

/**
 * Wrap react-oidc-context with the Cognito admin-group check.
 *
 * Admins are members of the "Administrators" Cognito group, exposed in the
 * ID token through the `cognito:groups` claim.
 */
export const useAuth = (): AuthState => {
  const auth = useOidcAuth()

  const groups =
    (auth.user?.profile['cognito:groups'] as string[] | undefined) ?? []

  return {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin: groups.includes(ADMIN_GROUP),
    userName:
      (auth.user?.profile.email as string | undefined) ??
      auth.user?.profile.sub ??
      null,
    signIn: () => void auth.signinRedirect(),
    signOut: () => void auth.removeUser(),
  }
}
