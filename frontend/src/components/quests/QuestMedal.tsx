import { useTranslation } from 'react-i18next'

import type { QuestKind } from '@/types'
import { cn } from '@/utils/cn'

import { QuestIcon } from './QuestIcon'

const KIND_CLASSES: Record<QuestKind, string> = {
  work: 'border-warm bg-warm/15 text-warm',
  study: 'border-accent bg-accent/15 text-accent',
  project: 'border-highlight bg-highlight/15 text-highlight',
}

interface QuestMedalProps {
  kind: QuestKind
}

/** Round badge with the symbol of the quest's domain. */
export const QuestMedal = ({ kind }: QuestMedalProps) => {
  const { t } = useTranslation()

  return (
    <span
      title={t(`home.quests.types.${kind}`)}
      className={cn(
        'relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 sm:h-14 sm:w-14',
        KIND_CLASSES[kind],
      )}
    >
      <QuestIcon kind={kind} className="h-5 w-5 sm:h-7 sm:w-7" />
      <span className="sr-only">{t(`home.quests.types.${kind}`)}</span>
    </span>
  )
}
