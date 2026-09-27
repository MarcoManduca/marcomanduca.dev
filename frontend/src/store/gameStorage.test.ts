import { initialGameState } from './gameSlice'
import { loadGameState, saveGameState } from './gameStorage'

describe('gameStorage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips progress without the pending toast', () => {
    saveGameState({
      unlocked: ['firstStep'],
      visitedProjects: ['a'],
      lastUnlocked: 'firstStep',
    })

    expect(loadGameState()).toEqual({
      unlocked: ['firstStep'],
      visitedProjects: ['a'],
      lastUnlocked: null,
    })
  })

  it('falls back to the initial state when nothing is saved', () => {
    expect(loadGameState()).toEqual(initialGameState)
  })

  it('falls back to the initial state on corrupted data', () => {
    localStorage.setItem('game', '{not json')

    expect(loadGameState()).toEqual(initialGameState)
  })

  it('keeps the progress of an older save with game mode off', () => {
    localStorage.setItem(
      'game',
      JSON.stringify({ gameMode: false, unlocked: ['reader'] }),
    )

    expect(loadGameState()).toEqual({
      ...initialGameState,
      unlocked: ['reader'],
    })
  })

  it('drops unknown figurines and malformed fields', () => {
    localStorage.setItem(
      'game',
      JSON.stringify({
        unlocked: ['reader', 'hacker'],
        visitedProjects: [42, 'b'],
      }),
    )

    expect(loadGameState()).toEqual({
      ...initialGameState,
      unlocked: ['reader'],
      visitedProjects: ['b'],
    })
  })
})
