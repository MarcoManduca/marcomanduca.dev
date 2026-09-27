import type { SkillGroup } from '@/types'

/** Highest level on the stats radar. */
export const MAX_STAT_LEVEL = 10

/** Level of each skill group on the stats radar. */
export const STAT_LEVELS: Readonly<Record<SkillGroup, number>> = {
  programming: 9,
  dataEngineering: 9,
  dataViz: 10,
  versioning: 7,
  crmStorage: 8,
  ai: 9,
}
