import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { QuestIcon } from '@/components/quests/QuestIcon'
import { useQuestOrigin } from '@/hooks/useQuestOrigin'

import { LABEL } from './styles'

interface QuestOriginProps {
  /** About page anchor of the CV entry, e.g. `study-2025-09`. */
  anchor: string | null
}

/** Link to the CV entry the project was born in. */
export const QuestOrigin = ({ anchor }: QuestOriginProps) => {
  const { t } = useTranslation()
  const quest = useQuestOrigin(anchor)

  if (!quest) return null

  return (
    <Link
      to={quest.to}
      className="flex items-center gap-3.5 rounded-2xl border-2 border-edge px-5 py-4 text-heading transition-colors hover:border-highlight"
    >
      <span
        aria-hidden="true"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-accent text-accent"
      >
        <QuestIcon kind={quest.kind} className="h-[22px] w-[22px]" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className={LABEL}>{t('projects.detail.questOrigin')}</span>
        <span className="font-display text-[19px] font-bold leading-tight">
          {quest.title}
        </span>
      </span>
      <span aria-hidden="true" className="ml-auto text-xl text-muted">
        →
      </span>
    </Link>
  )
}
