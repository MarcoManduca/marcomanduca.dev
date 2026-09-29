export type Theme = 'dark' | 'light'

/** localStorage key, shared with public/theme-init.js. */
export const THEME_STORAGE_KEY = 'theme'

/**
 * Browser UI colour (<meta name="theme-color">) matching each background.
 * Keep in sync with public/theme-init.js, which sets it before first paint.
 */
const THEME_COLORS: Record<Theme, string> = {
  dark: '#0D1B1F',
  light: '#EFE3C8',
}

/** Theme currently applied on <html> (set before paint by theme-init.js). */
export const readTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

const listeners = new Set<() => void>()

/**
 * Subscribe to theme changes made with `applyTheme` (the signature
 * `useSyncExternalStore` expects). Returns the unsubscribe function.
 */
export const subscribeTheme = (listener: () => void): (() => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Apply a theme to the document and remember it for the next visit. */
export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLORS[theme])
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Storage blocked (private mode): the choice lasts for this page only.
  }
  listeners.forEach((listener) => listener())
}
