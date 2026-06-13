import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

/**
 * Read the Cognito access token persisted by react-oidc-context.
 *
 * oidc-client-ts stores the authenticated user in sessionStorage under
 * `oidc.user:<authority>:<client_id>`. Reading it here keeps the RTK Query
 * base layer decoupled from React context.
 */
export const getAccessToken = (): string | null => {
  try {
    const key = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`
    const raw = sessionStorage.getItem(key)
    if (!raw) return null

    const user = JSON.parse(raw) as { access_token?: string }
    return user.access_token ?? null
  } catch {
    return null
  }
}
