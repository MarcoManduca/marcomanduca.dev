import type { KeyboardEvent, ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { useCardDeck } from '@/hooks/useCardDeck'
import { cn } from '@/utils/cn'

import { DeckCard } from './DeckCard'
import { deckCardStyle } from './deckCardStyle'

export interface DeckItem {
  key: string
  /** Announced when the card reaches the top. */
  title: string
  frame: string
  /** The card's face; `interactive` is true on the top card only. */
  render: (interactive: boolean) => ReactNode
}

/**
 * Height of the deck, fanned cards included. It fits the fullest card: three
 * areas and a title on two lines each, three lines of description and two
 * rows of technologies, down to 360px wide screens.
 */
export const DECK_HEIGHT = 'h-[552px] lg:h-[556px]'

interface SideQuestDeckProps {
  items: DeckItem[]
  labelledBy: string
  describedBy?: string
}

/**
 * The side quests as a fanned deck. Drag the top card away (or press the
 * right arrow) to send it to the bottom; the left arrow brings back the
 * bottom card. While it is dragged, the cards below rise toward the top.
 */
export const SideQuestDeck = ({
  items,
  labelledBy,
  describedBy,
}: SideQuestDeckProps) => {
  const { t } = useTranslation()
  const count = items.length
  const { top, dragX, dragging, thrown, next, previous, dragHandlers } =
    useCardDeck(count)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Partial<Record<string, () => void>> = {
      ArrowRight: next,
      ArrowLeft: previous,
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    move()
  }

  return (
    <div
      role="group"
      aria-roledescription={t('home.sideQuests.deck')}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        'relative mx-auto w-full max-w-[406px] rounded-[22px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-highlight',
        DECK_HEIGHT,
      )}
    >
      {items.map((item, index) => {
        const depth = (index - top + count) % count
        const isTop = depth === 0
        return (
          <DeckCard
            key={item.key}
            frameClassName={item.frame}
            isTop={isTop}
            handlers={isTop ? dragHandlers : undefined}
            style={{
              ...deckCardStyle({ depth, dragX, dragging, thrown }),
              zIndex: count - depth,
            }}
          >
            {item.render(isTop)}
          </DeckCard>
        )
      })}
      <p className="sr-only" aria-live="polite">
        {t('home.sideQuests.current', {
          index: top + 1,
          total: count,
          title: items[top].title,
        })}
      </p>
    </div>
  )
}
