/** Kind of CV entry on the About page timeline. */
export type TimelineKind = 'work' | 'study'

/** Anchor id of a CV entry on the About page, e.g. `work-2020-11`. */
export const timelineAnchor = (kind: TimelineKind, start: string) =>
  `${kind}-${start}`
