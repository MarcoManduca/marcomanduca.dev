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

/**
 * One quest as a fixed-height row: domain medal, name and its details. On
 * phones the details run full width under the medal and name; from `sm` they
 * sit in the name's column, with medal and arrow spanning both rows.
 */
export const QuestCard = ({ quest }: QuestCardProps) => {
  const facts = useQuestFacts(quest)
  const active = !quest.end

  return (
    <li>
      <Link
        to={quest.to}
        className={cn(
          'group grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 rounded-2xl border-2 border-edge bg-surface px-4 py-3.5 transition-colors sm:gap-x-[18px] sm:gap-y-1.5 sm:px-5 sm:py-[18px]',
          active
            ? cn('content-start sm:items-start', QUEST_CARD_HEIGHT.active)
            : cn('content-center', QUEST_CARD_HEIGHT.completed),
          'hover:border-warm/70',
        )}
      >
        <QuestMedal kind={quest.kind} className="sm:row-span-2" />
        <span
          title={quest.title}
          className={cn(QUEST_TITLE, 'text-heading group-hover:text-highlight')}
        >
          {quest.title}
        </span>
        <span
          aria-hidden="true"
          className="font-display text-xl text-muted group-hover:text-highlight sm:row-span-2"
        >
          →
        </span>
        <QuestFacts
          facts={facts}
          compact={!active}
          className="col-span-3 sm:col-span-1 sm:col-start-2"
        />
      </Link>
    </li>
  )
}
