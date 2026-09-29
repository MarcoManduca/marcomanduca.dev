import type { LocalizedText } from '@/types/i18n'

export const PROJECT_STATUSES = ['draft', 'published', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

/** Field of a project; a project has one to three, the first colours its card. */
export const PROJECT_AREAS = [
  'frontend',
  'backend',
  'cloud',
  'data',
  'ml',
  'dl',
  'ai',
] as const
export type ProjectArea = (typeof PROJECT_AREAS)[number]

/** Where the project was born. */
export const PROJECT_CONTEXTS = ['academic', 'personal', 'work'] as const
export type ProjectContext = (typeof PROJECT_CONTEXTS)[number]

/** Destination of a project link. */
export const LINK_KINDS = [
  'repo',
  'paper',
  'docs',
  'live',
  'video',
  'dataset',
] as const
export type LinkKind = (typeof LINK_KINDS)[number]

/** A key number shown on the card and the project page. */
export interface Metric {
  value: string
  label: LocalizedText
}

/** An image with the text that stands in for it. */
export interface MediaItem {
  src: string
  alt: LocalizedText
  caption?: LocalizedText | null
}

export interface ProjectLink {
  kind: LinkKind
  url: string
}

/** The project told as a quest: objective, final boss and rewards. */
export interface QuestBrief {
  objective: LocalizedText
  boss: LocalizedText
  rewards: LocalizedText
}

/** One image a slider reveals over a lab sample's base image. */
export interface LabLayer {
  id: string
  label: LocalizedText
  src: string
  alt: LocalizedText
  description: LocalizedText
}

export interface LabSample {
  id: string
  label: LocalizedText
  base: MediaItem
  layers: LabLayer[]
}

/** Optional interactive demo of a project page. */
export interface ProjectLab {
  kind: 'image-compare'
  model: string | null
  samples: LabSample[]
}

/** Everything a project card shows (Home deck, Projects grid). */
interface ProjectCardFields {
  title: LocalizedText
  description: LocalizedText
  /** One to three, all shown; the first colours the card. */
  areas: ProjectArea[]
  context: ProjectContext
  cover: MediaItem | null
  metrics: Metric[]
  technologies: string[]
}

/** Light project card returned by `GET /projects` (`ProjectCard`). */
export interface ProjectSummary extends ProjectCardFields {
  slug: string
  /** First repository link, for the card's code button. */
  repo_url: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

/**
 * Full project returned by `GET /projects/{slug}` (`ProjectResponse`).
 *
 * The slug is the primary key; there is no separate `id`. The site lists
 * only finished projects, so there is no progress, period or team.
 */
export interface Project extends ProjectCardFields {
  slug: string
  brief: QuestBrief
  content_markdown: LocalizedText
  topics: LocalizedText[]
  media: MediaItem[]
  links: ProjectLink[]
  /** Shown on the opening of the page; every project states one. */
  license: string
  /** About page anchor of the CV entry it was born in (`study-2025-09`). */
  quest: string | null
  /** Shown on the page only when present. */
  lab: ProjectLab | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

/** Payload to create or replace a project (`ProjectCreate`/`ProjectUpdate`). */
export type ProjectInput = Omit<Project, 'slug' | 'created_at' | 'updated_at'>

/** Query parameters accepted by `GET /projects`. */
export interface ProjectQuery {
  area?: ProjectArea
  context?: ProjectContext
  technology?: string
  search?: string
}
