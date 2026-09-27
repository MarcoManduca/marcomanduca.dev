import { useTranslation } from 'react-i18next'

import type { QuestFact } from '@/components/quests/QuestFacts'
import type { Quest } from '@/types'
import { formatMonthYear } from '@/utils/formatMonthYear'

import { useLanguage } from './useLanguage'

/**
 * Details shown under a quest name. Active quests expand to guild, start,
 * objective, final boss and rewards; completed ones keep guild and dates.
 */
export const useQuestFacts = (quest: Quest): QuestFact[] => {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const fact = (
    field: string,
    value: string | undefined,
    style: Pick<QuestFact, 'highlight' | 'long'> = {},
  ): QuestFact | undefined =>
    value
      ? { label: t(`home.quests.fields.${field}`), value, ...style }
      : undefined
  const month = (value?: string) =>
    value ? formatMonthYear(value, language) : undefined

  const facts = [
    fact('guild', quest.guild),
    // Projects have no guild yet: their technologies stand in as rewards.
    fact('rewards', quest.tags),
    fact('started', month(quest.start)),
    fact('completed', month(quest.end)),
  ]
  if (!quest.end) {
    facts.push(
      fact('objective', quest.objective, { long: true }),
      fact('boss', quest.boss, { long: true }),
      fact('rewards', quest.rewards, { highlight: true }),
    )
  }
  return facts.filter((fact): fact is QuestFact => Boolean(fact))
}
