import type { CSSProperties, ReactNode } from 'react'

import type { useCardDeck } from '@/hooks/useCardDeck'
import { cn } from '@/utils/cn'
import { DECK_SPREAD } from '@/utils/deckPose'

type DragHandlers = ReturnType<typeof useCardDeck>['dragHandlers']

interface DeckCardProps {
  /** Gradient stops of the foil frame. */
  frameClassName: string
  /** Pose of the card: transform, filter, opacity, stacking. */
  style: CSSProperties
  isTop: boolean
  /** Drag handlers, on the top card only. */
  handlers?: DragHandlers
  children: ReactNode
}

/**
 * One card of the deck, a foil frame placed by its pose. Only the top card
 * reacts to the pointer (vertical pans still scroll the page); the cards
 * below are hidden from assistive tech.
 */
export const DeckCard = ({
  frameClassName,
  style,
  isTop,
  handlers,
  children,
}: DeckCardProps) => (
  <div
    aria-hidden={!isTop}
    style={{
      width: `calc(100% - ${DECK_SPREAD.x}px)`,
      height: `calc(100% - ${DECK_SPREAD.y}px)`,
      ...style,
    }}
    {...handlers}
    className={cn(
      'absolute left-0 top-0 origin-bottom rounded-[22px] bg-gradient-to-br p-1.5 shadow-2xl shadow-black/40 motion-safe:transition-[transform,filter,opacity] motion-safe:duration-[450ms] motion-safe:ease-[cubic-bezier(0.2,0.8,0.2,1)]',
      frameClassName,
      isTop
        ? 'cursor-grab touch-pan-y select-none active:cursor-grabbing'
        : 'pointer-events-none',
    )}
  >
    {children}
  </div>
)
