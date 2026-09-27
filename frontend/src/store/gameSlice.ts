import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { AchievementId, GameState } from '@/types'
import { EXPLORER_GOAL, FOOTPRINT_GOAL } from '@/utils/achievements'

export const initialGameState: GameState = {
  unlocked: [],
  visitedProjects: [],
  footprints: 0,
  lastUnlocked: null,
}

const unlockIn = (state: GameState, id: AchievementId) => {
  if (state.unlocked.includes(id)) return
  state.unlocked.push(id)
  state.lastUnlocked = id
}

export const gameSlice = createSlice({
  name: 'game',
  initialState: initialGameState,
  reducers: {
    unlock: (state, { payload }: PayloadAction<AchievementId>) => {
      unlockIn(state, payload)
    },
    visitProject: (state, { payload }: PayloadAction<string>) => {
      if (!state.visitedProjects.includes(payload)) {
        state.visitedProjects.push(payload)
      }
      if (state.visitedProjects.length >= EXPLORER_GOAL) {
        unlockIn(state, 'explorer')
      }
    },
    /** Counts a footprint shown, up to the Level Up goal. */
    leaveFootprint: (state) => {
      if (state.footprints >= FOOTPRINT_GOAL) return
      state.footprints += 1
      if (state.footprints === FOOTPRINT_GOAL) unlockIn(state, 'levelUp')
    },
    dismissUnlock: (state) => {
      state.lastUnlocked = null
    },
  },
})

export const { unlock, visitProject, leaveFootprint, dismissUnlock } =
  gameSlice.actions
