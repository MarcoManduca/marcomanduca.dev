import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'

import App from '@/App'
import { store } from '@/store'
import { installPreloadErrorReload } from '@/utils/reloadOnPreloadError'

import '@/i18n'
import '@/index.css'

// A deploy replaces the chunks an open tab would lazy-load: reload once.
installPreloadErrorReload()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
