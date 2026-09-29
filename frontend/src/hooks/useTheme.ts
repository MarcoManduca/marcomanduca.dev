import { useCallback, useSyncExternalStore } from 'react'

import {
  applyTheme,
  readTheme,
  subscribeTheme,
  type Theme,
} from '@/utils/theme'

export interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

/**
 * Current colour theme plus a toggle that applies and persists it. Every
 * caller reads the same source (the document), so all the toggles on the
 * page (desktop header and mobile menu) stay in step.
 */
export const useTheme = (): ThemeState => {
  const theme = useSyncExternalStore(subscribeTheme, readTheme)

  const toggleTheme = useCallback(() => {
    applyTheme(readTheme() === 'dark' ? 'light' : 'dark')
  }, [])

  return { theme, toggleTheme }
}
