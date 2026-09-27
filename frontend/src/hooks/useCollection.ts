import { useAppSelector } from '@/store/hooks'
import { ACHIEVEMENT_IDS } from '@/types'

/** Figurines collected so far, for the collection shelf. */
export const useCollection = () => {
  const { unlocked, visitedProjects } = useAppSelector((state) => state.game)

  return {
    unlocked,
    visitedProjects,
    count: unlocked.length,
    total: ACHIEVEMENT_IDS.length,
  }
}
