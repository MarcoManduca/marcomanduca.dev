import { readBilingual } from '@/components/admin/readBilingual'
import type {
  MediaItem,
  ProjectArea,
  ProjectContext,
  ProjectInput,
  ProjectLink,
  ProjectStatus,
} from '@/types'
import { LINK_KINDS } from '@/types'

/** A JSON field of the project form holds text that does not parse. */
export class InvalidJsonError extends Error {
  constructor(readonly field: string) {
    super(`Invalid JSON in "${field}"`)
    this.name = 'InvalidJsonError'
  }
}

const text = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim()

const optional = (data: FormData, name: string) => text(data, name) || null

const readJson = <T>(data: FormData, field: string, empty: T): T => {
  const raw = text(data, field)
  if (!raw) return empty
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new InvalidJsonError(field)
  }
}

const readCover = (data: FormData): MediaItem | null => {
  const src = text(data, 'coverSrc')
  return src ? { src, alt: readBilingual(data, 'coverAlt') } : null
}

/** One URL input per link kind; the form edits the first link of each. */
const readLinks = (data: FormData): ProjectLink[] =>
  LINK_KINDS.flatMap((kind) => {
    const url = text(data, `link-${kind}`)
    return url ? [{ kind, url }] : []
  })

/** The main area first, then the optional ones, each area once. */
const readAreas = (data: FormData): ProjectArea[] => {
  const picked = ['mainArea', 'secondArea', 'thirdArea']
    .map((name) => text(data, name))
    .filter(Boolean)
  return [...new Set(picked)] as ProjectArea[]
}

/**
 * The project payload entered in the admin form.
 *
 * @throws InvalidJsonError when a JSON field (metrics, topics, media, lab)
 * does not parse; the server validates the shape of what does.
 */
export const toProjectInput = (
  data: FormData,
  technologies: string[],
): ProjectInput => ({
  title: readBilingual(data, 'title'),
  description: readBilingual(data, 'description'),
  areas: readAreas(data),
  context: text(data, 'context') as ProjectContext,
  cover: readCover(data),
  metrics: readJson(data, 'metrics', []),
  technologies,
  brief: {
    objective: readBilingual(data, 'briefObjective'),
    boss: readBilingual(data, 'briefBoss'),
    rewards: readBilingual(data, 'briefRewards'),
  },
  content_markdown: readBilingual(data, 'content'),
  topics: readJson(data, 'topics', []),
  media: readJson(data, 'media', []),
  links: readLinks(data),
  license: text(data, 'license'),
  quest: optional(data, 'quest'),
  lab: readJson(data, 'lab', null),
  status: text(data, 'status') as ProjectStatus,
})
