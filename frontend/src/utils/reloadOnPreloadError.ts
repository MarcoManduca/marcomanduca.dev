const STORAGE_KEY = 'preload-error-reload-at'
/** A new failure this soon after a reload means the fresh page fails too. */
const RELOAD_GUARD_MS = 10_000

interface PreloadErrorDeps {
  getStorage: () => Storage
  reload: () => void
  now: () => number
}

/**
 * Handler for Vite's `vite:preloadError`: a lazy chunk failed to load,
 * typically because a deploy replaced the build this tab started with.
 * Reloading fetches the current index.html and its chunks. A timestamp in
 * sessionStorage prevents a reload loop when the fresh build fails too; the
 * error then reaches the ErrorBoundary, as it does without storage.
 */
export const createPreloadErrorHandler =
  ({ getStorage, reload, now }: PreloadErrorDeps) =>
  (): void => {
    try {
      const storage = getStorage()
      const last = Number(storage.getItem(STORAGE_KEY) ?? 0)
      if (now() - last < RELOAD_GUARD_MS) return
      storage.setItem(STORAGE_KEY, String(now()))
    } catch {
      return
    }
    reload()
  }

/** Reload the page once when a code-split chunk can't be loaded. */
export const installPreloadErrorReload = (win: Window = window): void => {
  win.addEventListener(
    'vite:preloadError',
    createPreloadErrorHandler({
      getStorage: () => win.sessionStorage,
      reload: () => win.location.reload(),
      now: Date.now,
    }),
  )
}
