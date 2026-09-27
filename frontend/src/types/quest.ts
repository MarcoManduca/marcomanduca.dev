/** Domain of a CV entry: work experience or education. */
export type QuestKind = 'work' | 'study'

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

/** A row of the home quest log: a CV entry. */
export interface Quest extends Partial<QuestDetails> {
  key: string
  kind: QuestKind
  to: string
  title: string
  /** Start month as `YYYY-MM`. */
  start: string
  /** Completion month as `YYYY-MM`; absent while the quest is active. */
  end?: string
}
