import { ErrorResponse } from 'oidc-client-ts'

import { userManager } from './userManager'

/**
 * Result of a silent session renewal:
 * - `renewed`: a fresh user (and access token) was stored;
 * - `rejected`: the session can't be renewed (no refresh token, or Cognito
 *   refused it, e.g. `invalid_grant`), so it is over;
 * - `unavailable`: the attempt failed for a transient reason (offline, a
 *   timeout, a 5xx), so the session is kept for a later try.
 */
export type RefreshOutcome = 'renewed' | 'rejected' | 'unavailable'

let refreshing: Promise<RefreshOutcome> | null = null

const attemptRefresh = async (): Promise<RefreshOutcome> => {
  try {
    // Without a refresh token signinSilent would fall back to an iframe
    // flow this app does not configure, and fail like a network error.
    const user = await userManager.getUser()
    if (!user?.refresh_token) return 'rejected'
    return (await userManager.signinSilent()) ? 'renewed' : 'rejected'
  } catch (error) {
    // An OAuth error response from the token endpoint is final.
    return error instanceof ErrorResponse ? 'rejected' : 'unavailable'
  }
}

/**
 * Renew the session silently (refresh-token grant). Concurrent callers share
 * one attempt, so a burst of rejected requests triggers a single refresh.
 */
export const refreshSession = (): Promise<RefreshOutcome> => {
  refreshing ??= attemptRefresh().finally(() => {
    refreshing = null
  })
  return refreshing
}

/**
 * End the session locally. react-oidc-context receives `userUnloaded`, so the
 * admin area asks to sign in again instead of keeping a dead token.
 */
export const endSession = (): Promise<void> =>
  // Storage can be unavailable (blocked site data): nothing left to clear.
  userManager.removeUser().catch(() => undefined)
