import { fireEvent } from '@testing-library/react'

import { MAX_FOOTPRINTS } from '@/hooks/useFootprints'
import { renderWithProviders } from '@/test/utils'
import type { GameState } from '@/types'
import { FOOTPRINT_GOAL } from '@/utils/achievements'
import { STRIDE } from '@/utils/footprintGeometry'

import { Footprints } from './Footprints'

/** A page with a patch of empty background and a card on it. */
const renderPage = (progress?: Partial<GameState>) => {
  const view = renderWithProviders(
    <div>
      <Footprints />
      <div data-floor="" />
      <div data-card="" style={{ backgroundColor: 'rgb(20, 40, 50)' }} />
    </div>,
    { game: progress },
  )
  const floor = view.container.querySelector<HTMLElement>('[data-floor]')!
  const card = view.container.querySelector<HTMLElement>('[data-card]')!
  const prints = () =>
    Array.from(view.container.querySelectorAll<SVGElement>('[data-foot]'))
  const game = () => view.store.getState().game
  return { floor, card, prints, game }
}

/** Moves the mouse over `target` through `steps` strides, left to right. */
const walk = (target: HTMLElement, steps: number, pointerType = 'mouse') => {
  for (let step = 0; step <= steps; step++) {
    fireEvent.pointerMove(target, {
      clientX: step * STRIDE,
      clientY: 100,
      pointerType,
    })
  }
}

describe('Footprints', () => {
  afterEach(() => {
    vi.mocked(document.elementFromPoint).mockReset()
    vi.unstubAllGlobals()
  })

  it('leaves a print every stride, alternating the feet', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, 3)

    expect(prints().map((print) => print.dataset.foot)).toEqual([
      'left',
      'right',
      'left',
    ])
  })

  it('points the toes where the mouse is heading', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, 1)

    expect(prints()[0].style.transform).toContain('rotate(90deg)')
  })

  it('waits for a full stride before the next step', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    fireEvent.pointerMove(floor, { clientX: 0, clientY: 0 })
    fireEvent.pointerMove(floor, { clientX: STRIDE / 2, clientY: 0 })

    expect(prints()).toHaveLength(0)
  })

  it('never steps on a card', () => {
    const { floor, card, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(card, 3)

    expect(prints()).toHaveLength(0)
  })

  it('skips a print that would slip under a card beside the path', () => {
    const { floor, card, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(card)

    walk(floor, 3)

    expect(prints()).toHaveLength(0)
  })

  it('keeps the feet in step where a print does not show', () => {
    const { floor, card, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)
    const step = (target: HTMLElement, index: number) =>
      fireEvent.pointerMove(target, { clientX: index * STRIDE, clientY: 100 })

    step(floor, 0)
    step(floor, 1)
    step(card, 2)
    step(floor, 3)

    expect(prints().map((print) => print.dataset.foot)).toEqual([
      'left',
      'left',
    ])
  })

  it('walks with the mouse only, not touch', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, 3, 'touch')

    expect(prints()).toHaveLength(0)
  })

  it('stays still under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, 3)

    expect(prints()).toHaveLength(0)
  })

  it('keeps only the latest prints on screen', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, MAX_FOOTPRINTS + 5)

    expect(prints()).toHaveLength(MAX_FOOTPRINTS)
  })

  it('counts every print shown towards Level Up', () => {
    const { floor, card, game } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, MAX_FOOTPRINTS + 5)
    walk(card, 3)

    expect(game().footprints).toBe(MAX_FOOTPRINTS + 5)
  })

  it('unlocks Level Up with the last print of the goal', () => {
    const { floor, game } = renderPage({ footprints: FOOTPRINT_GOAL - 1 })
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)

    walk(floor, 1)

    expect(game().unlocked).toEqual(['levelUp'])
  })

  it('clears a print once it has faded', () => {
    const { floor, prints } = renderPage()
    vi.mocked(document.elementFromPoint).mockReturnValue(floor)
    walk(floor, 2)

    fireEvent.animationEnd(prints()[0])

    expect(prints()).toHaveLength(1)
  })
})
