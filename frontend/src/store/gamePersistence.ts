import type { GameState } from '@/types'

import { saveGameState } from './gameStorage'

/** Save at most this often: a mouse trail changes the state on every stride. */
const SAVE_DELAY_MS = 1000

interface GameStore {
  getState: () => { game: GameState }
  subscribe: (listener: () => void) => () => void
}

/**
 * Persist game progress to localStorage, batched: the first change schedules
 * a save and later changes join it, so a burst of footprints costs one write
 * per second instead of one per stride. Pending progress is flushed when the
 * page is hidden or left, so nothing but the last second of a crashed tab is
 * lost. Only game changes count, not API cache updates.
 *
 * @returns A cleanup that flushes and stops persisting.
 */
export const persistGameState = (
  store: GameStore,
  delayMs = SAVE_DELAY_MS,
  win: Window = window,
): (() => void) => {
  let saved = store.getState().game
  let timer: ReturnType<typeof setTimeout> | undefined

  const flush = () => {
    clearTimeout(timer)
    timer = undefined
    const { game } = store.getState()
    if (game === saved) return
    saved = game
    saveGameState(game)
  }
  const flushWhenHidden = () => {
    if (win.document.visibilityState === 'hidden') flush()
  }

  const unsubscribe = store.subscribe(() => {
    if (timer !== undefined || store.getState().game === saved) return
    timer = setTimeout(flush, delayMs)
  })
  win.addEventListener('pagehide', flush)
  win.document.addEventListener('visibilitychange', flushWhenHidden)

  return () => {
    flush()
    unsubscribe()
    win.removeEventListener('pagehide', flush)
    win.document.removeEventListener('visibilitychange', flushWhenHidden)
  }
}
