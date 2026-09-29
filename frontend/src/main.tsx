import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from 'react-oidc-context'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'

import App from '@/App'
import { userManager } from '@/services/userManager'
import { store } from '@/store'
import { COGNITO_REDIRECT_URI } from '@/utils/env'
import { isSigninCallback } from '@/utils/isSigninCallback'
import { installPreloadErrorReload } from '@/utils/reloadOnPreloadError'

import '@/i18n'
import '@/index.css'

// A deploy replaces the chunks an open tab would lazy-load: reload once.
installPreloadErrorReload()

const onSigninCallback = () => {
  // Remove OIDC query params from the URL after the redirect.
  window.history.replaceState({}, document.title, window.location.pathname)
}

// Exchange ?code=&state= only on the callback route, never on public pages.
const skipSigninCallback = !isSigninCallback(
  new URL(window.location.href),
  COGNITO_REDIRECT_URI,
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider
        userManager={userManager}
        onSigninCallback={onSigninCallback}
        skipSigninCallback={skipSigninCallback}
      >
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
