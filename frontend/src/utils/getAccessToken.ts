import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

/** Tokens this close to expiry (seconds) are treated as already expired. */
const EXPIRY_SKEW_SECONDS = 10

interface StoredOidcUser {
  access_token?: string
  refresh_token?: string
  /** Expiry as a Unix timestamp in seconds (oidc-client-ts format). */
  expires_at?: number
}

/**
 * sessionStorage key used by oidc-client-ts for the authenticated user:
 * `oidc.user:<authority>:<client_id>`.
 */
const storageKey = (): string =>
  `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`

const isExpired = (expiresAt: number | undefined): boolean =>
  typeof expiresAt === 'number' &&
  expiresAt - EXPIRY_SKEW_SECONDS <= Date.now() / 1000

/** The user oidc-client-ts stored, or null (none, unreadable storage). */
const readStoredUser = (): StoredOidcUser | null => {
  try {
    const raw = sessionStorage.getItem(storageKey())
    return raw ? (JSON.parse(raw) as StoredOidcUser) : null
  } catch {
    return null
  }
}

/**
 * Read the Cognito access token persisted by react-oidc-context.
 *
 * Reading sessionStorage here keeps the RTK Query base layer decoupled from
 * React context (and from the auth libraries, which only the admin area
 * loads). Expired tokens are never returned: the backend rejects them with
 * 401 even on public endpoints, so sending one would break public pages.
 */
export const getAccessToken = (): string | null => {
  const user = readStoredUser()
  if (!user?.access_token || isExpired(user.expires_at)) return null
  return user.access_token
}

/**
 * Whether the stored access token has expired but can still be renewed with
 * its refresh token, e.g. after the laptop slept past the token lifetime.
 */
export const hasRenewableSession = (): boolean => {
  const user = readStoredUser()
  return Boolean(user?.refresh_token) && isExpired(user?.expires_at)
}
