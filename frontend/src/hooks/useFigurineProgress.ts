import { useAppSelector } from '@/store/hooks'
import type { AchievementId, GameState } from '@/types'

/** Count behind each figurine earned with a goal. */
const PROGRESS: Partial<Record<AchievementId, (game: GameState) => number>> = {
  explorer: (game) => game.visitedProjects.length,
  levelUp: (game) => game.footprints,
}

/**
 * Count reached so far by a goal figurine (undefined for the others). Each
 * tile selects only its own number, so a footprint re-renders the Level Up
 * tile alone.
 */
export const useFigurineProgress = (id: AchievementId): number | undefined =>
  useAppSelector((state) => PROGRESS[id]?.(state.game))
