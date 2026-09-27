/**
 * Whether `url` is where Cognito sends the browser back after sign-in, i.e.
 * the path of the OIDC redirect URI. Only there should `?code=&state=` be
 * exchanged; anywhere else those parameters are not ours.
 */
export const isSigninCallback = (url: URL, redirectUri: string): boolean =>
  url.pathname === new URL(redirectUri, url.origin).pathname
