import { Link } from 'react-router-dom'

import { useQuestFacts } from '@/hooks/useQuestFacts'
import type { Quest } from '@/types'
import { cn } from '@/utils/cn'

import { QUEST_CARD_HEIGHT, QUEST_TITLE } from './questCardLayout'
import { QuestFacts } from './QuestFacts'
import { QuestMedal } from './QuestMedal'

interface QuestCardProps {
  quest: Quest
}

/** One quest as a fixed-height row: domain medal, name and its details. */
export const QuestCard = ({ quest }: QuestCardProps) => {
  const facts = useQuestFacts(quest)
  const active = !quest.end

  return (
    <li>
      <Link
        to={quest.to}
        className={cn(
          'group grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-2xl border-2 border-edge bg-surface px-4 py-3.5 transition-colors sm:gap-[18px] sm:px-5 sm:py-[18px]',
          active
            ? cn('items-start', QUEST_CARD_HEIGHT.active)
            : cn('items-center', QUEST_CARD_HEIGHT.completed),
          'hover:border-warm/70',
        )}
      >
        <QuestMedal kind={quest.kind} />
        <span className="flex min-w-0 flex-col gap-1.5">
          <span
            title={quest.title}
            className={cn(
              QUEST_TITLE,
              'text-heading group-hover:text-highlight',
            )}
          >
            {quest.title}
          </span>
          <QuestFacts facts={facts} compact={!active} />
        </span>
        <span
          aria-hidden="true"
          className="font-display text-xl text-muted group-hover:text-highlight"
        >
          →
        </span>
      </Link>
    </li>
  )
}
