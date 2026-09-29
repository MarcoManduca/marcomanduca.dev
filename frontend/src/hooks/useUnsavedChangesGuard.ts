import { useEffect } from 'react'

/**
 * Ask the browser to confirm before leaving the page (reload, close, sign
 * in again) while `active`, e.g. while an admin form has unsaved changes.
 * In-app navigation is not covered: the app uses a plain BrowserRouter.
 */
export const useUnsavedChangesGuard = (active: boolean): void => {
  useEffect(() => {
    if (!active) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      // Legacy browsers only show the prompt when returnValue is set.
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [active])
}
