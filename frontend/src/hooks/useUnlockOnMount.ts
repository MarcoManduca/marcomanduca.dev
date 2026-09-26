import { useEffect } from 'react'

import { unlock } from '@/store/gameSlice'
import { useAppDispatch } from '@/store/hooks'
import type { AchievementId } from '@/types'

/** Unlock a figurine as soon as `when` holds (e.g. once content has loaded). */
export const useUnlockOnMount = (id: AchievementId, when = true) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (when) dispatch(unlock(id))
  }, [dispatch, id, when])
}
