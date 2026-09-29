import { THROW_DISTANCE } from '@/hooks/useCardDeck'
import { deckPose, dragPose, throwPose } from '@/utils/deckPose'

import { deckCardStyle } from './deckCardStyle'

const resting = { dragX: 0, dragging: false, thrown: null }

describe('deckCardStyle', () => {
  it('rests the top card in its deck pose', () => {
    expect(deckCardStyle({ ...resting, depth: 0 })).toEqual({
      transform: deckPose(0).transform,
    })
  })

  it('moves the dragged top card with the pointer, without transition', () => {
    expect(
      deckCardStyle({ depth: 0, dragX: 40, dragging: true, thrown: null }),
    ).toEqual({ transform: dragPose(40), transition: 'none' })
  })

  it('fades the thrown top card out along its throw', () => {
    const style = deckCardStyle({ ...resting, depth: 0, thrown: -1 })

    expect(style).toMatchObject({ transform: throwPose(-1), opacity: 0 })
  })

  it('raises a lower card as the drag nears a throw', () => {
    const style = deckCardStyle({
      depth: 1,
      dragX: THROW_DISTANCE / 2,
      dragging: true,
      thrown: null,
    })

    expect(style.transform).toBe(deckPose(0.5).transform)
  })

  it('moves a lower card up one place once the top card is thrown', () => {
    const style = deckCardStyle({ ...resting, depth: 2, thrown: 1 })

    expect(style.transform).toBe(deckPose(1).transform)
  })

  it('hides the cards past the last visible pose', () => {
    expect(deckCardStyle({ ...resting, depth: 4 }).opacity).toBe(0)
  })
})
