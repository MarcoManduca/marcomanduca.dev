/** Collectible "figurines" earned by exploring the site. */
export const ACHIEVEMENT_IDS = [
  'firstStep',
  'explorer',
  'reader',
  'polyglot',
  'secret',
  'contact',
] as const

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number]

export interface GameState {
  /** Whether gamified UI (collection, figurines, toasts) is shown. */
  gameMode: boolean
  unlocked: AchievementId[]
  /** Distinct project slugs opened, towards the explorer figurine. */
  visitedProjects: string[]
  /** Most recent unlock, shown as a toast until dismissed. Not persisted. */
  lastUnlocked: AchievementId | null
}
