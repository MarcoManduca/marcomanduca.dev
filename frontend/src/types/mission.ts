export type MissionStatus = 'active' | 'done' | 'new'

/** A card of the home "mission deck". */
export interface Mission {
  key: string
  to: string
  kind: string
  status: MissionStatus
  title: string
  meta: string
  featured?: boolean
}
