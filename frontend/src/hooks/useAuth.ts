import { useAuth as useOidcAuth } from 'react-oidc-context'

import { ADMIN_GROUP, COGNITO_CLIENT_ID, COGNITO_DOMAIN } from '@/utils/env'

/**
 * Build the Cognito hosted-UI logout URL.
 *
 * Cognito does not expose a standard OIDC `end_session_endpoint`, so a full
 * sign-out (ending the hosted-UI session, not just clearing local tokens)
 * requires redirecting to `/logout` with the client id and a registered
 * `logout_uri`.
 */
const cognitoLogoutUrl = (): string => {
  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    logout_uri: `${window.location.origin}/`,
  })
  return `${COGNITO_DOMAIN}/logout?${params.toString()}`
}

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
    signOut: () => {
      // Clear local tokens, then end the Cognito session via the hosted UI.
      void auth.removeUser()
      if (COGNITO_DOMAIN) window.location.assign(cognitoLogoutUrl())
    },
  }
}
