import { useMemo } from 'react'

import { useGetProjectsQuery } from '@/services/projectsApi'

/**
 * Published projects as side quests, oldest first, so "SQ: 01" is the first
 * project. Admins also get drafts from the API: they stay off the Home.
 */
export const useSideQuests = () => {
  const { data, isLoading } = useGetProjectsQuery()

  const projects = useMemo(
    () =>
      (data ?? [])
        .filter(({ status }) => status === 'published')
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [data],
  )

  return { projects, isLoading }
}
