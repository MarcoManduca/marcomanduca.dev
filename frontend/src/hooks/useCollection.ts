import { useAppSelector } from '@/store/hooks'
import { ACHIEVEMENT_IDS } from '@/types'

/** Figurines collected so far, for counters and the figurine shelf. */
export const useCollection = () => {
  const { gameMode, unlocked, visitedProjects } = useAppSelector(
    (state) => state.game,
  )

  return {
    gameMode,
    unlocked,
    visitedProjects,
    count: unlocked.length,
    total: ACHIEVEMENT_IDS.length,
  }
}
