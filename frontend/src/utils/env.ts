/**
 * Centralized access to Vite environment variables.
 *
 * `||` rather than `??`: Docker build args default to an empty string, which
 * must fall back to the default just like an unset variable.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const COGNITO_AUTHORITY = import.meta.env.VITE_COGNITO_AUTHORITY || ''
export const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || ''
/** The OIDC callback route, which lives in the (lazy) admin routes. */
export const COGNITO_REDIRECT_URI =
  import.meta.env.VITE_COGNITO_REDIRECT_URI ||
  `${window.location.origin}/admin/callback`

/** Cognito hosted UI origin, used for the sign-out (`/logout`) redirect. */
export const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN || ''

export const ADMIN_GROUP = 'Administrators'
export const SITE_URL = 'https://marcomanduca.dev'
