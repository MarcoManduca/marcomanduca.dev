import { useState } from 'react'

import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { useQuests } from '@/hooks/useQuests'
import type { QuestTab } from '@/types'
import { questPanelId, questTabId } from '@/utils/questTabIds'

import { NextQuestSlot } from './NextQuestSlot'
import { QuestCard } from './QuestCard'
import { QuestTabs } from './QuestTabs'

/** Home quest log: active and completed quests in two tabs. */
export const QuestLog = () => {
  const { t } = useTranslation()
  const { active, completed } = useQuests()
  const [tab, setTab] = useState<QuestTab>('active')
  const quests = tab === 'active' ? active : completed

  return (
    <section
      aria-label={t('home.quests.tablist')}
      className="flex min-w-0 flex-col gap-4"
    >
      <QuestTabs
        selected={tab}
        counts={{ active: active.length, completed: completed.length }}
        onSelect={setTab}
      />

      <div
        id={questPanelId(tab)}
        role="tabpanel"
        aria-labelledby={questTabId(tab)}
        className="flex flex-col gap-3 sm:gap-4"
      >
        {/* Equal rows: every card takes the height of the tallest. */}
        <ul className="grid auto-rows-fr gap-3 sm:gap-4">
          {quests.map((quest) => (
            <QuestCard key={quest.key} quest={quest} />
          ))}
        </ul>
        {tab === 'active' && <NextQuestSlot />}
      </div>

      {/* The projects are one section down, behind the side quests deck. */}
      <Link
        to="/about-me"
        className="self-end font-display text-[15px] font-bold uppercase tracking-wider text-highlight hover:text-heading sm:text-base"
      >
        {t('home.quests.fullPath')} →
      </Link>
    </section>
  )
}
