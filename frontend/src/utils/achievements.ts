import type { AchievementId } from '@/types'

/** Distinct projects to open for the explorer figurine. */
export const EXPLORER_GOAL = 3

/** Footprints to leave on the background for the Level Up figurine. */
export const FOOTPRINT_GOAL = 1000

/** Figurines earned by reaching a count, with the count to reach. */
export const ACHIEVEMENT_GOALS: Partial<Record<AchievementId, number>> = {
  explorer: EXPLORER_GOAL,
  levelUp: FOOTPRINT_GOAL,
}
