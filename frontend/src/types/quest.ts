export type QuestKind = 'work' | 'study' | 'project'

export type QuestTab = 'active' | 'completed'

/** RPG framing of a CV entry, from the locale files. */
export interface QuestDetails {
  /** Organisation the quest was carried out with. */
  guild: string
  objective?: string
  /** The toughest challenge of the quest. */
  boss?: string
  /** Skills earned along the way. */
  rewards?: string
}

/** A row of the home quest log (a CV entry or a published project). */
export interface Quest extends Partial<QuestDetails> {
  key: string
  kind: QuestKind
  to: string
  title: string
  /** Start month as `YYYY-MM`, when known. */
  start?: string
  /** Completion month as `YYYY-MM`; absent while the quest is active. */
  end?: string
  /** Short technology list, shown for projects in place of a guild. */
  tags?: string
}
