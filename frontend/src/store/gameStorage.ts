import { ACHIEVEMENT_IDS, type AchievementId, type GameState } from '@/types'

import { initialGameState } from './gameSlice'

const STORAGE_KEY = 'game'

const isAchievementId = (value: unknown): value is AchievementId =>
  ACHIEVEMENT_IDS.includes(value as AchievementId)

const isString = (value: unknown): value is string => typeof value === 'string'

const isCount = (value: unknown): value is number =>
  Number.isInteger(value) && (value as number) >= 0

/** Eclipse was saved as `secret` while it was a hidden figurine. */
const renamed = (value: unknown) => (value === 'secret' ? 'eclipse' : value)

/**
 * Restore saved progress, discarding anything malformed or unknown (such as
 * the retired `gameMode` flag of older saves).
 */
export const loadGameState = (): GameState => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')
    if (!saved || typeof saved !== 'object') return initialGameState
    const { unlocked, visitedProjects, footprints } = saved as Partial<
      Record<keyof GameState, unknown>
    >
    return {
      ...initialGameState,
      unlocked: Array.isArray(unlocked)
        ? unlocked.map(renamed).filter(isAchievementId)
        : [],
      visitedProjects: Array.isArray(visitedProjects)
        ? visitedProjects.filter(isString)
        : [],
      footprints: isCount(footprints) ? footprints : 0,
    }
  } catch {
    return initialGameState
  }
}

/** Persist progress locally; the pending toast is session-only. */
export const saveGameState = ({
  unlocked,
  visitedProjects,
  footprints,
}: GameState) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unlocked, visitedProjects, footprints }),
    )
  } catch {
    // Storage blocked: progress lasts for this session only.
  }
}
