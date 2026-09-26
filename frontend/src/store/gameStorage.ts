import { ACHIEVEMENT_IDS, type AchievementId, type GameState } from '@/types'

import { initialGameState } from './gameSlice'

const STORAGE_KEY = 'game'

const isAchievementId = (value: unknown): value is AchievementId =>
  ACHIEVEMENT_IDS.includes(value as AchievementId)

const isString = (value: unknown): value is string => typeof value === 'string'

/** Restore saved progress, discarding anything malformed or unknown. */
export const loadGameState = (): GameState => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')
    if (!saved || typeof saved !== 'object') return initialGameState
    const { gameMode, unlocked, visitedProjects } = saved as Partial<
      Record<keyof GameState, unknown>
    >
    return {
      ...initialGameState,
      gameMode: typeof gameMode === 'boolean' ? gameMode : true,
      unlocked: Array.isArray(unlocked) ? unlocked.filter(isAchievementId) : [],
      visitedProjects: Array.isArray(visitedProjects)
        ? visitedProjects.filter(isString)
        : [],
    }
  } catch {
    return initialGameState
  }
}

/** Persist progress locally; the pending toast is session-only. */
export const saveGameState = ({
  gameMode,
  unlocked,
  visitedProjects,
}: GameState) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ gameMode, unlocked, visitedProjects }),
    )
  } catch {
    // Storage blocked: progress lasts for this session only.
  }
}
