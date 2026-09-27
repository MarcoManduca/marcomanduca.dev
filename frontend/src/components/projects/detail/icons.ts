import type { LinkKind, ProjectContext, QuestBrief } from '@/types'

/** Line icons of the project page, as path data on a 24×24 box. */
export const BRIEF_ICONS: Record<keyof QuestBrief, readonly string[]> = {
  objective: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
    'M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0',
  ],
  boss: ['M13 2 4 14h7l-1 8 9-12h-7z'],
  rewards: ['M6 3h12l3 6-9 12L3 9z', 'M3 9h18', 'm9 3 3 6 3-6'],
}

export const LINK_ICONS: Record<LinkKind, readonly string[]> = {
  repo: ['m8 8-4 4 4 4', 'm16 8 4 4-4 4'],
  paper: ['M6 3h9l4 4v14H6z', 'M14 3v5h5', 'M9 13h7', 'M9 17h5'],
  docs: [
    'M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z',
    'M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5',
  ],
  live: [
    'M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
    'M3 12h18',
    'M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18',
  ],
  video: ['M8 5v14l11-7z'],
  dataset: [
    'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z',
    'M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
    'M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  ],
}

export const CONTEXT_ICONS: Record<ProjectContext, readonly string[]> = {
  academic: [
    'M2 9.5 12 5l10 4.5-10 4.5L2 9.5Z',
    'M6 11.5V16c0 1.4 2.7 3 6 3s6-1.6 6-3v-4.5',
  ],
  personal: ['M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  work: [
    'M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7',
    'M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z',
  ],
}

export const PLAY_ICON = ['M8 5v14l11-7z'] as const
export const SPLIT_ICON = ['m9 7-5 5 5 5', 'm15 7 5 5-5 5'] as const
