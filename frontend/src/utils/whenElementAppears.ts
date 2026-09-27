/**
 * Call `onAppear` with the element whose id is `id` as soon as it is in the
 * document: right away when it already is, otherwise once a DOM change adds
 * it (a lazy page or API data rendering it later). Waiting stops after
 * `timeoutMs` or when the returned cancel function is called.
 */
export const whenElementAppears = (
  id: string,
  onAppear: (element: HTMLElement) => void,
  timeoutMs: number,
): (() => void) => {
  const existing = document.getElementById(id)
  if (existing) {
    onAppear(existing)
    return () => undefined
  }

  const observer = new MutationObserver(() => {
    const element = document.getElementById(id)
    if (!element) return
    cancel()
    onAppear(element)
  })
  const timer = window.setTimeout(() => cancel(), timeoutMs)
  const cancel = () => {
    observer.disconnect()
    window.clearTimeout(timer)
  }
  observer.observe(document.body, { childList: true, subtree: true })
  return cancel
}
