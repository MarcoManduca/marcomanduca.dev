import { useRef, type KeyboardEvent } from 'react'

import { useTranslation } from 'react-i18next'

import type { QuestTab } from '@/types'
import { cn } from '@/utils/cn'
import { questPanelId, questTabId } from '@/utils/questTabIds'

const TABS: QuestTab[] = ['active', 'completed']

/** RPG quest marker: "!" on a diamond for quests still open. */
const ActiveMarker = () => (
  <span
    aria-hidden="true"
    className="flex h-4 w-4 rotate-45 items-center justify-center rounded-[3px] bg-highlight sm:h-5 sm:w-5"
  >
    <span className="-rotate-45 font-display text-xs font-extrabold leading-none text-background sm:text-sm">
      !
    </span>
  </span>
)

const CompletedMarker = () => (
  <span aria-hidden="true" className="text-success">
    ✓
  </span>
)

interface QuestTabsProps {
  selected: QuestTab
  counts: Record<QuestTab, number>
  onSelect: (tab: QuestTab) => void
}

/** "Active / Completed quests" tab list with arrow-key navigation. */
export const QuestTabs = ({ selected, counts, onSelect }: QuestTabsProps) => {
  const { t } = useTranslation()
  const tabRefs = useRef<Partial<Record<QuestTab, HTMLButtonElement | null>>>(
    {},
  )

  const handleKeyDown = ({ key }: KeyboardEvent) => {
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return
    const next = selected === 'active' ? 'completed' : 'active'
    onSelect(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={t('home.quests.tablist')}
      onKeyDown={handleKeyDown}
      // Baseline drawn as an inset shadow: the tabs' underline paints over it
      // without overflowing, so the row only ever scrolls horizontally.
      className="flex overflow-x-auto overflow-y-hidden pl-2 pt-1.5 shadow-[inset_0_-2px_0_0_rgb(var(--color-edge))]"
    >
      {TABS.map((tab) => {
        const isSelected = tab === selected
        return (
          <button
            key={tab}
            ref={(node) => {
              tabRefs.current[tab] = node
            }}
            id={questTabId(tab)}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-controls={questPanelId(tab)}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(tab)}
            className={cn(
              'flex items-center gap-1.5 whitespace-nowrap border-b-4 pb-3 font-display text-lg font-extrabold uppercase transition-colors min-[400px]:text-xl sm:gap-3 sm:text-[34px]',
              tab === 'active' ? 'pr-2 sm:pr-5' : 'px-2 sm:px-5',
              isSelected
                ? 'border-warm text-heading'
                : 'border-transparent text-muted hover:text-heading',
            )}
          >
            {tab === 'active' ? <ActiveMarker /> : <CompletedMarker />}
            {t(`home.quests.${tab}`)}
            <span className="text-sm text-muted sm:text-lg">{counts[tab]}</span>
          </button>
        )
      })}
    </div>
  )
}
