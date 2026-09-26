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

      <ul
        id={questPanelId(tab)}
        role="tabpanel"
        aria-labelledby={questTabId(tab)}
        className="flex flex-col gap-3 sm:gap-4"
      >
        {quests.map((quest) => (
          <QuestCard key={quest.key} quest={quest} />
        ))}
        {tab === 'active' && <NextQuestSlot />}
      </ul>

      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/projects"
          className="flex min-h-14 items-center justify-center rounded-xl bg-warm px-7 font-display text-xl font-extrabold uppercase tracking-wide text-background transition-colors hover:bg-warm-hover"
        >
          {t('home.quests.cta')}
        </Link>
        <Link
          to="/about-me"
          className="text-center font-display text-lg font-bold uppercase tracking-wider text-highlight hover:text-heading"
        >
          {t('home.quests.fullPath')} →
        </Link>
      </div>
    </section>
  )
}
