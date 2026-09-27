import type { ProjectSummary } from '@/types'

import { useSideQuests } from './useSideQuests'

export interface ProjectNeighbours {
  /** Place of the project in the side quests deck, from 1. */
  number: number
  total: number
  previous?: ProjectSummary
  next?: ProjectSummary
}

/**
 * Where a project sits among the side quests (oldest first, as on the Home
 * deck), with the projects on either side. `null` for a project off the
 * deck, such as a draft.
 */
export const useProjectNeighbours = (
  slug: string,
): ProjectNeighbours | null => {
  const { projects } = useSideQuests()
  const index = projects.findIndex((project) => project.slug === slug)
  if (index < 0) return null

  return {
    number: index + 1,
    total: projects.length,
    previous: projects[index - 1],
    next: projects[index + 1],
  }
}
