import type { LocalizedText } from '@/types/i18n'

import type { ProjectStatus } from './project'

/** Backend `LearningCategory` StrEnum values, exactly as sent over the wire. */
export const LEARNING_CATEGORIES = [
  'CS',
  'Data',
  'SWE',
  'Cloud',
  'Math',
] as const
export type LearningCategory = (typeof LEARNING_CATEGORIES)[number]

export type ArticleStatus = ProjectStatus

/**
 * Latest version of a learning article (`ArticleResponse`).
 *
 * Identified by `slug` + `version`; there is no separate `id`. Articles
 * carry bilingual markdown content but no summary field.
 */
export interface LearningArticle {
  slug: string
  title: LocalizedText
  content_markdown: LocalizedText
  category: LearningCategory
  tags: string[]
  status: ArticleStatus
  version: number
  created_at: string
  updated_at: string
}

/** Payload to create or update an article (`ArticleCreate`/`ArticleUpdate`). */
export type LearningArticleInput = Omit<
  LearningArticle,
  'slug' | 'version' | 'created_at' | 'updated_at'
>

/** Compact version descriptor (`ArticleVersionInfo`). */
export interface ArticleVersion {
  version: number
  updated_at: string
  status: ArticleStatus
}

/** Query parameters accepted by `GET /learning`. */
export interface LearningQuery {
  category?: LearningCategory
  tag?: string
}
