import { userManager } from './userManager'

let refreshing: Promise<boolean> | null = null

/**
 * Renew the session silently (refresh-token grant). Concurrent callers share
 * one attempt, so a burst of rejected requests triggers a single refresh.
 * Resolves to whether a fresh user was stored.
 */
export const refreshSession = (): Promise<boolean> => {
  refreshing ??= userManager
    .signinSilent()
    .then(
      (user) => user !== null,
      () => false,
    )
    .finally(() => {
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
