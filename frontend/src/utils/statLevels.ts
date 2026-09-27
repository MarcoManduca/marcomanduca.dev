import type { StatGroup } from '@/types'

/** Highest level on the stats radar. */
export const MAX_STAT_LEVEL = 10

/**
 * Radar axes, clockwise from the top, with their level. The levels are
 * placeholders until the way to score each group is settled.
 */
export const STAT_LEVELS: readonly { group: StatGroup; level: number }[] = [
  { group: 'programming', level: 9 },
  { group: 'dataEngineering', level: 8 },
  { group: 'dataViz', level: 8 },
  { group: 'versioning', level: 7 },
  { group: 'storage', level: 7 },
  { group: 'crm', level: 4 },
]
