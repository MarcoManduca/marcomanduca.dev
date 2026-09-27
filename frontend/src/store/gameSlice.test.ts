import {
  dismissUnlock,
  gameSlice,
  initialGameState,
  unlock,
  visitProject,
} from './gameSlice'

const reduce = gameSlice.reducer

describe('gameSlice', () => {
  it('unlocks a figurine once and flags it for the toast', () => {
    const once = reduce(initialGameState, unlock('reader'))
    const twice = reduce({ ...once, lastUnlocked: null }, unlock('reader'))

    expect(once.unlocked).toEqual(['reader'])
    expect(once.lastUnlocked).toBe('reader')
    expect(twice.unlocked).toEqual(['reader'])
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

  it('dismisses the pending toast', () => {
    const dismissed = reduce(
      { ...initialGameState, lastUnlocked: 'contact' },
      dismissUnlock(),
    )

    expect(dismissed.lastUnlocked).toBeNull()
  })
})
