import type { CSSProperties } from 'react'

import { THROW_DISTANCE, THROW_MS } from '@/hooks/useCardDeck'
import { deckPose, dragPose, throwPose } from '@/utils/deckPose'

interface DeckCardStyleInput {
  /** 0 for the top card, 1 for the one below it, ... */
  depth: number
  dragX: number
  dragging: boolean
  /** Side the top card is being thrown to, if it is. */
  thrown: 1 | -1 | null
}

/**
 * Pose of one card of the side-quest deck. The top card follows the drag
 * (or flies off when thrown); the cards below rise toward the top as the
 * drag gets closer to a throw, and move up one place once it happens.
 */
export const deckCardStyle = ({
  depth,
  dragX,
  dragging,
  thrown,
}: DeckCardStyleInput): CSSProperties => {
  if (depth === 0) {
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

  const pull = Math.min(1, Math.abs(dragX) / THROW_DISTANCE)
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
