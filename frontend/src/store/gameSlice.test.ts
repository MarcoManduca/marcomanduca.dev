import { FOOTPRINT_GOAL } from '@/utils/achievements'

import {
  dismissUnlock,
  gameSlice,
  initialGameState,
  leaveFootprint,
  unlock,
  visitProject,
} from './gameSlice'

const reduce = gameSlice.reducer

describe('gameSlice', () => {
  it('unlocks a figurine once and flags it for the toast', () => {
    const once = reduce(initialGameState, unlock('contact'))
    const twice = reduce({ ...once, lastUnlocked: null }, unlock('contact'))

    expect(once.unlocked).toEqual(['contact'])
    expect(once.lastUnlocked).toBe('contact')
    expect(twice.unlocked).toEqual(['contact'])
    expect(twice.lastUnlocked).toBeNull()
  })

  it('counts distinct projects and unlocks the explorer at the goal', () => {
    const state = ['a', 'a', 'b', 'c'].reduce(
      (acc, slug) => reduce(acc, visitProject(slug)),
      initialGameState,
    )

    expect(state.visitedProjects).toEqual(['a', 'b', 'c'])
    expect(state.unlocked).toEqual(['explorer'])
  })

  it('keeps the explorer locked below the goal', () => {
    const state = reduce(initialGameState, visitProject('a'))

    expect(state.unlocked).toEqual([])
  })

  it('counts footprints and unlocks Level Up at the goal', () => {
    const before = { ...initialGameState, footprints: FOOTPRINT_GOAL - 2 }
    const almost = reduce(before, leaveFootprint())
    const reached = reduce(almost, leaveFootprint())

    expect(almost.footprints).toBe(FOOTPRINT_GOAL - 1)
    expect(almost.unlocked).toEqual([])
    expect(reached.footprints).toBe(FOOTPRINT_GOAL)
    expect(reached.unlocked).toEqual(['levelUp'])
    expect(reached.lastUnlocked).toBe('levelUp')
  })

  it('stops counting footprints once Level Up is earned', () => {
    const done = {
      ...initialGameState,
      unlocked: ['levelUp' as const],
      footprints: FOOTPRINT_GOAL,
    }

    expect(reduce(done, leaveFootprint())).toBe(done)
  })

  it('dismisses the pending toast', () => {
    const dismissed = reduce(
      { ...initialGameState, lastUnlocked: 'contact' },
      dismissUnlock(),
    )

    expect(dismissed.lastUnlocked).toBeNull()
  })
})
