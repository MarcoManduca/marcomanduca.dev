import type { LinkKind, ProjectLink } from '@/types'

import { safeExternalUrl } from './safeUrl'

/** The links whose URL is a safe http(s) one. */
export const safeLinks = (links: ProjectLink[]): ProjectLink[] =>
  links.flatMap((link) => {
    const url = safeExternalUrl(link.url)
    return url ? [{ ...link, url }] : []
  })

/** Which links lead on a project page: a live site first, then the code. */
const LEAD_ORDER: readonly LinkKind[] = [
  'live',
  'repo',
  'paper',
  'video',
  'docs',
  'dataset',
]

/** The `count` links a project page puts first, as buttons. */
export const leadLinks = (links: ProjectLink[], count: number) =>
  safeLinks(links)
    .sort((a, b) => LEAD_ORDER.indexOf(a.kind) - LEAD_ORDER.indexOf(b.kind))
    .filter(
      (link, index, sorted) =>
        sorted.findIndex(({ kind }) => kind === link.kind) === index,
    )
    .slice(0, count)
