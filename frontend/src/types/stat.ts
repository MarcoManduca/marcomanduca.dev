/**
 * CV skill groups, in the order the About page lists them and the Home
 * stats radar plots them (clockwise from the top).
 */
export const SKILL_GROUPS = [
  'programming',
  'dataEngineering',
  'dataViz',
  'versioning',
  'crmStorage',
  'ai',
] as const

export type SkillGroup = (typeof SKILL_GROUPS)[number]

/** One radar axis: a skill group with its level and tools. */
export interface Stat {
  group: SkillGroup
  /** Full group name, as on the About page. */
  name: string
  /** Short label drawn at the end of the axis. */
  axis: string
  level: number
  skills: string[]
}
