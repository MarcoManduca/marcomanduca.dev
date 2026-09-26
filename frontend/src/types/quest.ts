export type QuestKind = 'work' | 'study' | 'project'

/** A row of the home quest log (a CV entry or a published project). */
export interface Quest {
  key: string
  kind: QuestKind
  to: string
  title: string
  subtitle: string
  /** Year the quest was completed; absent while it is active. */
  year?: number
}

export type QuestTab = 'active' | 'completed'
