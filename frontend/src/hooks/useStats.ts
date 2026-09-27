import { useTranslation } from 'react-i18next'

import type { Stat } from '@/types'
import { STAT_LEVELS } from '@/utils/statLevels'

/** Radar axes: each CV skill group with its level and tools. */
export const useStats = (): Stat[] => {
  const { t } = useTranslation()

  return STAT_LEVELS.map(({ group, level }) => ({
    group,
    level,
    name: t(`about.skillGroups.${group}`),
    axis: t(`home.stats.axis.${group}`),
    skills: t(`about.skills.${group}`, { returnObjects: true }) as string[],
  }))
}
