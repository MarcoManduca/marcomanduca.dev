import type { MutableRefObject, PointerEvent } from 'react'

import { act, renderHook } from '@testing-library/react'

import { useCardTilt } from './useCardTilt'

// A 400×560 card at the viewport origin.
const currentTarget = {
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 560 }),
}

const pointer = (pointerType: string, clientX: number, clientY: number) =>
  ({
    pointerType,
    clientX,
    clientY,
    currentTarget,
  }) as unknown as PointerEvent<HTMLElement>

const setup = () => {
  const card = document.createElement('div')
  const { result } = renderHook(() => useCardTilt<HTMLDivElement>())
  ;(result.current.tiltRef as MutableRefObject<HTMLDivElement>).current = card
  const tilt = () => [
    card.style.getPropertyValue('--tilt-x'),
    card.style.getPropertyValue('--tilt-y'),
  ]
  return { handlers: result.current.tiltHandlers, tilt }
}

describe('useCardTilt', () => {
  it('leans the corner under the mouse toward the viewer', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))

    expect(tilt()).toEqual(['-8deg', '-8deg'])
  })

  it('stays flat with the pointer at the centre', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 200, 280)))

    expect(tilt()).toEqual(['0deg', '0deg'])
  })

  it('settles back when the pointer leaves', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 0, 560)))
    expect(tilt()).toEqual(['8deg', '8deg'])
    act(() => handlers.onPointerLeave())

    expect(tilt()).toEqual(['0deg', '0deg'])
  })

  it('ignores touch, which swipes the card instead', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('touch', 400, 0)))

    expect(tilt()).toEqual(['', ''])
  })
})
