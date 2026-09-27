import type { QuestTab } from '@/types'

/** DOM ids linking each quest tab to its panel (ARIA tabs pattern). */
export const questPanelId = (tab: QuestTab) => `quests-${tab}-panel`
export const questTabId = (tab: QuestTab) => `quests-${tab}-tab`
