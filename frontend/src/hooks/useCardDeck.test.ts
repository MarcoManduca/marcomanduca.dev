import type { MouseEvent, PointerEvent } from 'react'

import { act, renderHook } from '@testing-library/react'

import { THROW_MS, useCardDeck } from './useCardDeck'

const pointer = (clientX: number) =>
  ({
    clientX,
    button: 0,
    pointerId: 1,
    currentTarget: { setPointerCapture: vi.fn() },
  }) as unknown as PointerEvent<HTMLElement>

const click = () =>
  ({
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  }) as unknown as MouseEvent<HTMLElement>

const setup = (count = 3) => renderHook(() => useCardDeck(count))

/** Press at x = 100, move to `to` and release there. */
const drag = (hook: ReturnType<typeof setup>, to: number) => {
  act(() => hook.result.current.dragHandlers.onPointerDown(pointer(100)))
  act(() => hook.result.current.dragHandlers.onPointerMove(pointer(to)))
  act(() => hook.result.current.dragHandlers.onPointerUp(pointer(to)))
}

describe('useCardDeck', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('follows the pointer while the top card is dragged', () => {
    const hook = setup()

    act(() => hook.result.current.dragHandlers.onPointerDown(pointer(100)))
    act(() => hook.result.current.dragHandlers.onPointerMove(pointer(160)))

    expect(hook.result.current.dragging).toBe(true)
    expect(hook.result.current.dragX).toBe(60)
  })

  it('throws the card past the throw distance, then deals the next one', () => {
    const hook = setup()

    drag(hook, 250)
    expect(hook.result.current.thrown).toBe(1)
    act(() => vi.advanceTimersByTime(THROW_MS))

    expect(hook.result.current.thrown).toBeNull()
    expect(hook.result.current.top).toBe(1)
  })

  it('throws the card to the left when dragged left', () => {
    const hook = setup()

    drag(hook, -50)

    expect(hook.result.current.thrown).toBe(-1)
  })

  it('lets a short drag settle back on top', () => {
    const hook = setup()

    drag(hook, 150)

    expect(hook.result.current.thrown).toBeNull()
    expect(hook.result.current.dragX).toBe(0)
    expect(hook.result.current.top).toBe(0)
  })

  it('settles back when the browser takes over the gesture', () => {
    const hook = setup()
    act(() => hook.result.current.dragHandlers.onPointerDown(pointer(100)))
    act(() => hook.result.current.dragHandlers.onPointerMove(pointer(300)))

    act(() => hook.result.current.dragHandlers.onPointerCancel())

    expect(hook.result.current.dragging).toBe(false)
    expect(hook.result.current.top).toBe(0)
  })

  it('keeps a tap a tap: tiny moves do not drag nor block the click', () => {
    const hook = setup()
    const event = click()

    drag(hook, 103)
    act(() => hook.result.current.dragHandlers.onClickCapture(event))

    expect(hook.result.current.dragging).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  it('swallows the click that ends a drag, so links stay put', () => {
    const hook = setup()
    const event = click()

    drag(hook, 150)
    act(() => hook.result.current.dragHandlers.onClickCapture(event))

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('goes round: the last card is followed by the first', () => {
    const hook = setup(2)

    act(() => hook.result.current.next())
    act(() => vi.advanceTimersByTime(THROW_MS))
    act(() => hook.result.current.next())
    act(() => vi.advanceTimersByTime(THROW_MS))

    expect(hook.result.current.top).toBe(0)
  })

  it('brings the bottom card back to the top', () => {
    const hook = setup()

    act(() => hook.result.current.previous())

    expect(hook.result.current.top).toBe(2)
  })

  it('leaves a single card where it is', () => {
    const hook = setup(1)

    drag(hook, 300)
    act(() => hook.result.current.next())

    expect(hook.result.current.thrown).toBeNull()
    expect(hook.result.current.top).toBe(0)
  })

  it('deals the next card at once under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const hook = setup()

    act(() => hook.result.current.next())

    expect(hook.result.current.thrown).toBeNull()
    expect(hook.result.current.top).toBe(1)
  })
})
