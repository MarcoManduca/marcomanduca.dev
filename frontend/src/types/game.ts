/** Collectible "figurines" earned by exploring the site. */
export const ACHIEVEMENT_IDS = [
  'firstStep',
  'curious',
  'explorer',
  'polyglot',
  'eclipse',
  'contact',
  'levelUp',
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export interface GameState {
  unlocked: AchievementId[]
  /** Distinct project slugs opened, towards the explorer figurine. */
  visitedProjects: string[]
  /** Footprints shown so far, towards the Level Up figurine. */
  footprints: number
  /** Most recent unlock, shown as a toast until dismissed. Not persisted. */
  lastUnlocked: AchievementId | null
}
