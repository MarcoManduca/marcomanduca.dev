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
    highlight = false,
  ): QuestFact | undefined =>
    value
      ? { label: t(`home.quests.fields.${field}`), value, highlight }
      : undefined
  const month = (value?: string) =>
    value ? formatMonthYear(value, language) : undefined

  const facts = [
    fact('guild', quest.guild),
    fact('started', month(quest.start)),
    fact('completed', month(quest.end)),
  ]
  if (!quest.end) {
    facts.push(
      fact('objective', quest.objective),
      fact('boss', quest.boss),
      fact('rewards', quest.rewards, true),
    )
  }
  return facts.filter((fact): fact is QuestFact => Boolean(fact))
}
