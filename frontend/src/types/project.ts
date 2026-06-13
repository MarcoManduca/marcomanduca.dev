import type { LocalizedText } from '@/types/i18n'

export const PROJECT_STATUSES = ['draft', 'published', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_CATEGORIES = [
  'data',
  'backend',
  'frontend',
  'cloud',
  'other',
] as const
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number]

/**
 * Project as returned by the backend (`ProjectResponse`).
 *
 * The slug is the primary key; there is no separate `id`. Category is a
 * free-form string on the backend, kept as a loose string here while the
 * UI still offers a fixed set of choices in forms and filters.
 */
export interface Project {
  slug: string
  title: LocalizedText
  description: LocalizedText
  content_markdown: LocalizedText
  technologies: string[]
  category: string
  images: string[]
  github_url: string
  demo_url: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

/** Payload to create or replace a project (`ProjectCreate`/`ProjectUpdate`). */
export type ProjectInput = Omit<Project, 'slug' | 'created_at' | 'updated_at'>

/** Query parameters accepted by `GET /projects`. */
export interface ProjectQuery {
  category?: string
  technology?: string
  search?: string
}
