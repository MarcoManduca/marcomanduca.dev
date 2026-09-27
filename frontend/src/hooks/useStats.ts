import { useTranslation } from 'react-i18next'

import { SKILL_GROUPS, type Stat } from '@/types'
import { STAT_LEVELS } from '@/utils/statLevels'

/** Radar axes: each CV skill group with its level and tools. */
export const useStats = (): Stat[] => {
  const { t } = useTranslation()

  return SKILL_GROUPS.map((group) => ({
    group,
    level: STAT_LEVELS[group],
    name: t(`about.skillGroups.${group}`),
    axis: t(`home.stats.axis.${group}`),
    skills: t(`about.skills.${group}`, { returnObjects: true }) as string[],
  }))
}
