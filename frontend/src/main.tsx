import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from 'react-oidc-context'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import App from '@/App'
import { ROUTER_FUTURE_FLAGS } from '@/routes/routerFutureFlags'
import { store } from '@/store'
import {
  COGNITO_AUTHORITY,
  COGNITO_CLIENT_ID,
  COGNITO_REDIRECT_URI,
} from '@/utils/env'

import '@/i18n'
import '@/index.css'

const oidcConfig = {
  authority: COGNITO_AUTHORITY,
  client_id: COGNITO_CLIENT_ID,
  redirect_uri: COGNITO_REDIRECT_URI,
  response_type: 'code',
  scope: 'openid email profile',
  onSigninCallback: () => {
    // Remove OIDC query params from the URL after the redirect.
    window.history.replaceState({}, document.title, window.location.pathname)
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider {...oidcConfig}>
        <Provider store={store}>
          <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
            <App />
          </BrowserRouter>
        </Provider>
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
