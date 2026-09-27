import { useAppSelector } from '@/store/hooks'
import { ACHIEVEMENT_IDS, type AchievementId } from '@/types'

/** Figurines collected so far, for the collection shelf. */
export const useCollection = () => {
  const { unlocked, visitedProjects, footprints } = useAppSelector(
    (state) => state.game,
  )
  /** Count reached so far by the figurines earned with a goal. */
  const progress: Partial<Record<AchievementId, number>> = {
    explorer: visitedProjects.length,
    levelUp: footprints,
  }

  return {
    unlocked,
    progress,
    count: unlocked.length,
    total: ACHIEVEMENT_IDS.length,
  }
}
