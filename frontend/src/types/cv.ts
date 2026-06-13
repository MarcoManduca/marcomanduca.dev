import type { Language } from '@/types/i18n'

/** Fixed set of CV sections (`CvSectionId`). */
export const CV_SECTION_IDS = [
  'summary',
  'experience',
  'education',
  'skills',
] as const
export type CvSectionId = (typeof CV_SECTION_IDS)[number]

/**
 * Arbitrary structured content the backend stores per section. It can be a
 * plain string, a list, or a nested object; the renderer handles each shape.
 */
export type CvContent = unknown

/** Bilingual section content (`LocalizedContent`). */
export interface LocalizedContent {
  it: CvContent
  en: CvContent
}

/**
 * The CV localized to a single language (`CvResponse`).
 *
 * `sections` maps a section id to its content already resolved to the
 * requested language.
 */
export interface Cv {
  lang: Language
  sections: Record<string, CvContent>
}

/** A stored CV section with bilingual content (`CvSectionResponse`). */
export interface CvSection {
  section: CvSectionId
  content: LocalizedContent
}

/** Payload to replace a CV section (`CvSectionUpdate`). */
export interface CvSectionUpdate {
  content: LocalizedContent
}
