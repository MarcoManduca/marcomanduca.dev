import {
  createPreloadErrorHandler,
  installPreloadErrorReload,
} from './reloadOnPreloadError'

const memoryStorage = (): Storage => {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  } as Storage
}

const setup = (storage: Storage = memoryStorage()) => {
  const clock = { now: 1_000_000 }
  const reload = vi.fn()
  const handle = createPreloadErrorHandler({
    getStorage: () => storage,
    reload,
    now: () => clock.now,
  })
  return { clock, reload, handle }
}

describe('createPreloadErrorHandler', () => {
  it('reloads on the first chunk failure', () => {
    const { reload, handle } = setup()

    handle()

    expect(reload).toHaveBeenCalledOnce()
  })

  it('does not reload again right after a reload', () => {
    const { clock, reload, handle } = setup()

    handle()
    clock.now += 5_000
    handle()

    expect(reload).toHaveBeenCalledOnce()
  })

  it('reloads again once the guard window has passed', () => {
    const { clock, reload, handle } = setup()

    handle()
    clock.now += 10_000
    handle()

    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('does not reload when storage is unavailable', () => {
    const storage = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError')
      },
    } as unknown as Storage
    const { reload, handle } = setup(storage)

    expect(() => handle()).not.toThrow()
    expect(reload).not.toHaveBeenCalled()
  })
})

describe('installPreloadErrorReload', () => {
  it('reloads the window on vite:preloadError', () => {
    const target = new EventTarget()
    const reload = vi.fn()
    const win = Object.assign(target, {
      sessionStorage: memoryStorage(),
      location: { reload },
    }) as unknown as Window

    installPreloadErrorReload(win)
    win.dispatchEvent(new Event('vite:preloadError'))

    expect(reload).toHaveBeenCalledOnce()
  })
})
