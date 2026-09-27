import type { CSSProperties, ReactNode } from 'react'

import { useTranslation } from 'react-i18next'

import { THROW_DISTANCE, THROW_MS, useCardDeck } from '@/hooks/useCardDeck'
import { deckPose, dragPose, throwPose } from '@/utils/deckPose'

import { DeckCard } from './DeckCard'

export interface DeckItem {
  key: string
  /** Announced when the card reaches the top. */
  title: string
  frame: string
  /** The card's face; `interactive` is true on the top card only. */
  render: (interactive: boolean) => ReactNode
}

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
  const pull = Math.min(1, Math.abs(dragX) / THROW_DISTANCE)

  const topPose = (): CSSProperties => {
    if (thrown) {
      return {
        transform: throwPose(thrown),
        opacity: 0,
        transition: `transform ${THROW_MS}ms ease-in, opacity ${THROW_MS}ms ease-in`,
      }
    }
    if (dragging) return { transform: dragPose(dragX), transition: 'none' }
    return { transform: deckPose(0).transform }
  }

  const lowerPose = (depth: number): CSSProperties => {
    const { transform, filter, hidden } = deckPose(
      thrown ? depth - 1 : depth - pull,
    )
    return {
      transform,
      filter,
      opacity: hidden ? 0 : 1,
      transition: dragging ? 'none' : undefined,
    }
  }

  return (
    <div
      role="group"
      aria-roledescription={t('home.sideQuests.deck')}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          next()
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault()
          previous()
        }
      }}
      className="relative mx-auto h-[496px] w-full max-w-[406px] rounded-[22px] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-highlight lg:h-[526px]"
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
              ...(isTop ? topPose() : lowerPose(depth)),
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
