import type { ReactElement, ReactNode } from 'react'

import { render } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'

import { makeStore } from '@/store'
import { initialGameState } from '@/store/gameSlice'
import type { GameState } from '@/types'

import { createTestI18n } from './i18n'

interface RenderOptions {
  route?: string
  /** Initial gamification progress (defaults to a fresh visitor). */
  game?: Partial<GameState>
}

/** Render with a fresh Redux store, test i18n instance and memory router. */
export const renderWithProviders = (
  ui: ReactElement,
  { route = '/', game }: RenderOptions = {},
) => {
  const store = makeStore({ ...initialGameState, ...game })
  const i18n = createTestI18n()

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <HelmetProvider>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </I18nextProvider>
      </Provider>
    </HelmetProvider>
  )

  return { store, i18n, ...render(ui, { wrapper: Wrapper }) }
}
