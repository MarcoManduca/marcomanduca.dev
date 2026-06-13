/** Centralized access to Vite environment variables. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export const COGNITO_AUTHORITY = import.meta.env.VITE_COGNITO_AUTHORITY ?? ''
export const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID ?? ''
export const COGNITO_REDIRECT_URI =
  import.meta.env.VITE_COGNITO_REDIRECT_URI ?? window.location.origin

/** Cognito hosted UI origin, used for the sign-out (`/logout`) redirect. */
export const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN ?? ''

export const ADMIN_GROUP = 'Administrators'
export const SITE_URL = 'https://marcomanduca.dev'
