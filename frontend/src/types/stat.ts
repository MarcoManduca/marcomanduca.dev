/** CV skill groups plotted on the Home stats radar. */
export type StatGroup =
  | 'programming'
  | 'dataEngineering'
  | 'dataViz'
  | 'versioning'
  | 'storage'
  | 'crm'

/** One radar axis: a skill group with its level and tools. */
export interface Stat {
  group: StatGroup
  /** Full group name, as on the About page. */
  name: string
  /** Short label drawn at the end of the axis. */
  axis: string
  level: number
  skills: string[]
}
