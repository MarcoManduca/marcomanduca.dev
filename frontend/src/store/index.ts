import { configureStore } from '@reduxjs/toolkit'

import { api } from '@/services/api'
import type { GameState } from '@/types'

import { gameSlice, initialGameState } from './gameSlice'
import { loadGameState, saveGameState } from './gameStorage'

/** Factory used by the app entry point and by tests (fresh store per test). */
export const makeStore = (game: GameState = initialGameState) =>
  configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [gameSlice.name]: gameSlice.reducer,
    },
    preloadedState: { [gameSlice.name]: game },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  })

export const store = makeStore(loadGameState())

// Persist only when game progress changes, not on every API cache update.
let savedGame = store.getState().game
store.subscribe(() => {
  const { game } = store.getState()
  if (game === savedGame) return
  savedGame = game
  saveGameState(game)
})

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
