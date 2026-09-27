import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '@/utils/cn'

import { QUEST_CARD_HEIGHT, QUEST_TITLE } from './questCardLayout'

/** Face-down card closing the active quests: propose the next one. */
export const NextQuestSlot = () => {
  const { t } = useTranslation()

  return (
    <Link
      to="/contacts"
      className={cn(
        'group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border-2 border-dashed border-edge px-4 py-3.5 text-muted transition-colors hover:border-warm/70 sm:gap-[18px] sm:px-5 sm:py-[18px]',
        QUEST_CARD_HEIGHT.nextQuest,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-edge font-display text-xl font-extrabold group-hover:border-warm/70 group-hover:text-highlight sm:h-14 sm:w-14 sm:text-2xl"
      >
        ?
      </span>
      <span className="flex min-w-0 flex-col gap-1.5">
        <span className={cn(QUEST_TITLE, 'group-hover:text-highlight')}>
          {t('home.quests.nextQuest')}
        </span>
        <span className="line-clamp-2 text-sm leading-5 sm:line-clamp-1 sm:text-[15px]">
          {t('home.quests.nextQuestHint')}
        </span>
      </span>
      <span
        aria-hidden="true"
        className="font-display text-xl group-hover:text-highlight"
      >
        →
      </span>
    </Link>
  )
}
