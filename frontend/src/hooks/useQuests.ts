import { useTranslation } from 'react-i18next'

import type { EducationEntry } from '@/components/about/EducationTimeline'
import type { ExperienceEntry } from '@/components/about/ExperienceTimeline'
import type { Quest, QuestDetails, QuestKind } from '@/types'
import { timelineAnchor } from '@/utils/timelineAnchor'

/** Newest completion first; `YYYY-MM` strings sort chronologically. */
const byEndDesc = (a: Quest, b: Quest) =>
  (b.end ?? '').localeCompare(a.end ?? '')

interface CvEntry {
  start: string
  end: string | null
  quest: QuestDetails
}

/** A CV entry as a quest, linked to its entry on the About page timeline. */
const cvQuest = (kind: QuestKind, title: string, entry: CvEntry): Quest => {
  const anchor = timelineAnchor(kind, entry.start)
  return {
    key: anchor,
    kind,
    to: `/about-me#${anchor}`,
    title,
    start: entry.start,
    end: entry.end ?? undefined,
    ...entry.quest,
  }
}

export interface QuestLog {
  active: Quest[]
  completed: Quest[]
}

/**
 * Home quest log built from the CV copy: an entry without an `end` month is
 * active, the others are completed (projects get a section of their own).
 */
export const useQuests = (): QuestLog => {
  const { t } = useTranslation()

  const experience = t('about.experience', {
    returnObjects: true,
  }) as ExperienceEntry[]
  const education = t('about.education', {
    returnObjects: true,
  }) as EducationEntry[]

  const quests = [
    ...experience.map((entry) => cvQuest('work', entry.role, entry)),
    ...education.map((entry) => cvQuest('study', entry.degree, entry)),
  ]

  return {
    active: quests.filter(({ end }) => !end),
    completed: quests.filter(({ end }) => end).sort(byEndDesc),
  }
}
