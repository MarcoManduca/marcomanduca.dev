import { useEffect } from 'react'

import { visitProject } from '@/store/gameSlice'
import { useAppDispatch } from '@/store/hooks'

/** Count an opened project towards the explorer figurine once it loads. */
export const useTrackProjectVisit = (slug: string | undefined) => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (slug) dispatch(visitProject(slug))
  }, [dispatch, slug])
}
