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
  const hook = renderHook(() => useCardTilt<HTMLDivElement>())
  ;(hook.result.current.tiltRef as MutableRefObject<HTMLDivElement>).current =
    card
  const read = (x: string, y: string) => [
    card.style.getPropertyValue(x),
    card.style.getPropertyValue(y),
  ]
  const tilt = () => read('--tilt-x', '--tilt-y')
  const foil = () => read('--foil-x', '--foil-y')
  return { handlers: hook.result.current.tiltHandlers, tilt, foil, hook }
}

const settle = () => act(() => vi.advanceTimersByTime(1000))

describe('useCardTilt', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('leans the corner under the mouse toward the viewer', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))
    settle()

    expect(tilt()).toEqual(['-8deg', '-8deg'])
  })

  it('slides the foil sheen toward the corner under the mouse', () => {
    const { handlers, foil } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))
    settle()

    expect(foil()).toEqual(['15%', '-15%'])
  })

  it('eases toward the pointer instead of jumping to it', () => {
    const { handlers, tilt } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))
    act(() => vi.advanceTimersByTime(16))
    const [tiltX] = tilt().map(parseFloat)

    expect(tiltX).toBeLessThan(0)
    expect(tiltX).toBeGreaterThan(-8)
  })

  it('stays flat with the pointer at the centre', () => {
    const { handlers, tilt, foil } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 200, 280)))
    settle()

    expect(tilt()).toEqual(['0deg', '0deg'])
    expect(foil()).toEqual(['0%', '0%'])
  })

  it('settles back when the pointer leaves', () => {
    const { handlers, tilt, foil } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 0, 560)))
    settle()
    expect(tilt()).toEqual(['8deg', '8deg'])
    expect(foil()).toEqual(['-15%', '15%'])
    act(() => handlers.onPointerLeave())
    settle()

    expect(tilt()).toEqual(['0deg', '0deg'])
    expect(foil()).toEqual(['0%', '0%'])
  })

  it('stops the frame loop once the card has settled', () => {
    const { handlers } = setup()

    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))
    settle()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels a running frame loop on unmount', () => {
    const { handlers, hook } = setup()
    act(() => handlers.onPointerMove(pointer('mouse', 400, 0)))
    expect(vi.getTimerCount()).toBe(1)

    hook.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('ignores touch, which swipes the card instead', () => {
    const { handlers, tilt, foil } = setup()

    act(() => handlers.onPointerMove(pointer('touch', 400, 0)))
    settle()

    expect(tilt()).toEqual(['', ''])
    expect(foil()).toEqual(['', ''])
  })
})
