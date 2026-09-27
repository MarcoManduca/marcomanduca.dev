import { useCallback, useState } from 'react'

import { applyTheme, readTheme, type Theme } from '@/utils/theme'

export interface ThemeState {
  theme: Theme
  toggleTheme: () => void
}

/** Current colour theme plus a toggle that applies and persists it. */
export const useTheme = (): ThemeState => {
  const [theme, setTheme] = useState<Theme>(readTheme)

  const toggleTheme = useCallback(() => {
    const next: Theme = readTheme() === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setTheme(next)
  }, [])

  return { theme, toggleTheme }
}
