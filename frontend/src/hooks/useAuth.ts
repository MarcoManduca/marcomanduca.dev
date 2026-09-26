import { useCallback, useMemo } from 'react'

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
  error: Error | null
  userName: string | null
  /** Path requested before the sign-in redirect (unvalidated), if any. */
  returnTo?: string | null
  /** Redirect to the hosted UI, optionally coming back to `returnTo`. */
  signIn: (returnTo?: string) => void
  signOut: () => void
}

interface SigninState {
  returnTo?: unknown
}

const readReturnTo = (state: unknown): string | null => {
  const returnTo = (state as SigninState | null | undefined)?.returnTo
  return typeof returnTo === 'string' ? returnTo : null
}

/**
 * Wrap react-oidc-context with the Cognito admin-group check.
 *
 * Admins are members of the "Administrators" Cognito group, exposed in the
 * ID token through the `cognito:groups` claim. The returned object and its
 * functions are memoized so effects depending on them do not re-run (and
 * re-trigger a sign-in redirect) on every render.
 */
export const useAuth = (): AuthState => {
  const {
    isLoading,
    isAuthenticated,
    error,
    user,
    signinRedirect,
    removeUser,
  } = useOidcAuth()

  const signIn = useCallback(
    (returnTo?: string) =>
      void signinRedirect(returnTo ? { state: { returnTo } } : undefined),
    [signinRedirect],
  )

  const signOut = useCallback(() => {
    // Clear local tokens, then end the Cognito session via the hosted UI.
    void removeUser()
    if (COGNITO_DOMAIN) window.location.assign(cognitoLogoutUrl())
  }, [removeUser])

  return useMemo(() => {
    const groups =
      (user?.profile['cognito:groups'] as string[] | undefined) ?? []
    return {
      isLoading,
      isAuthenticated,
      isAdmin: groups.includes(ADMIN_GROUP),
      error: error ?? null,
      userName:
        (user?.profile.email as string | undefined) ??
        user?.profile.sub ??
        null,
      returnTo: readReturnTo(user?.state),
      signIn,
      signOut,
    }
  }, [isLoading, isAuthenticated, error, user, signIn, signOut])
}
