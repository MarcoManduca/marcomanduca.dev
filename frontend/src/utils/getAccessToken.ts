import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

/** Tokens this close to expiry (seconds) are treated as already expired. */
const EXPIRY_SKEW_SECONDS = 10

interface StoredOidcUser {
  access_token?: string
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

/**
 * Read the Cognito access token persisted by react-oidc-context.
 *
 * Reading sessionStorage here keeps the RTK Query base layer decoupled from
 * React context. Expired tokens are never returned: the backend rejects them
 * with 401 even on public endpoints, so sending one would break public pages.
 */
export const getAccessToken = (): string | null => {
  try {
    const raw = sessionStorage.getItem(storageKey())
    if (!raw) return null

    const user = JSON.parse(raw) as StoredOidcUser
    if (!user.access_token || isExpired(user.expires_at)) return null
    return user.access_token
  } catch {
    return null
  }
}
