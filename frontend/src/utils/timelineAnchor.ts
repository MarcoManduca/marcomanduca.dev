import type { QuestKind } from '@/types'

/** Anchor id of a CV entry on the About page, e.g. `work-2020-11`. */
export const timelineAnchor = (kind: QuestKind, start: string) =>
  `${kind}-${start}`
