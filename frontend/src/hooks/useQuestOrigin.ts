import type { Quest } from '@/types'

import { useQuests } from './useQuests'

/** The CV entry a project was born in, from its About page anchor. */
export const useQuestOrigin = (anchor: string | null): Quest | undefined => {
  const { active, completed } = useQuests()
  if (!anchor) return undefined
  return [...active, ...completed].find((quest) => quest.key === anchor)
}
