import { UserManager } from 'oidc-client-ts'

import {
  COGNITO_AUTHORITY,
  COGNITO_CLIENT_ID,
  COGNITO_REDIRECT_URI,
} from '@/utils/env'

/**
 * The app's single oidc-client-ts `UserManager`.
 *
 * React code reaches it through react-oidc-context (`<AuthProvider
 * userManager>`); the RTK Query base query uses it directly to refresh or end
 * a session the API rejected. Sharing one instance keeps the auth context in
 * step with those changes (`userLoaded` / `userUnloaded` events) instead of it
 * holding a token that no longer works. The user is stored in sessionStorage
 * under `oidc.user:<authority>:<client_id>` (the library default), which
 * `getAccessToken` reads.
 */
export const userManager = new UserManager({
  authority: COGNITO_AUTHORITY,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid email profile',
})
