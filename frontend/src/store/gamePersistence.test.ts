import { makeStore } from '@/store'

import { leaveFootprint, unlock } from './gameSlice'
import { persistGameState } from './gamePersistence'

const savedGame = () => JSON.parse(localStorage.getItem('game') ?? 'null')

describe('persistGameState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('saves a burst of changes once, after the delay', () => {
    const store = makeStore()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    persistGameState(store, 1000)

    store.dispatch(leaveFootprint())
    store.dispatch(leaveFootprint())
    store.dispatch(leaveFootprint())

    expect(setItem).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(setItem).toHaveBeenCalledOnce()
    expect(savedGame().footprints).toBe(3)
  })

  it('flushes pending progress when the page is left', () => {
    const store = makeStore()
    persistGameState(store, 1000)

    store.dispatch(unlock('contact'))
    window.dispatchEvent(new Event('pagehide'))

    expect(savedGame().unlocked).toContain('contact')
  })

  it('flushes pending progress when the page is hidden', () => {
    const store = makeStore()
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden')
    persistGameState(store, 1000)

    store.dispatch(leaveFootprint())
    document.dispatchEvent(new Event('visibilitychange'))

    expect(savedGame().footprints).toBe(1)
  })

  it('does not write when the game did not change', () => {
    const store = makeStore()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const stop = persistGameState(store, 1000)

    stop()

    expect(setItem).not.toHaveBeenCalled()
  })
})
