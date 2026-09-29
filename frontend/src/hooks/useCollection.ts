import { useAppSelector } from '@/store/hooks'
import { ACHIEVEMENT_IDS } from '@/types'

/**
 * Figurines collected so far, for the collection shelf. Only the unlocked
 * list is selected: footprints change on every stride of the mouse, and the
 * shelf must not re-render for them (see useFigurineProgress).
 */
export const useCollection = () => {
  const unlocked = useAppSelector((state) => state.game.unlocked)

  return {
    unlocked,
    count: unlocked.length,
    total: ACHIEVEMENT_IDS.length,
  }
}
