import { initialGameState } from './gameSlice'
import { loadGameState, saveGameState } from './gameStorage'

describe('gameStorage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips progress without the pending toast', () => {
    saveGameState({
      unlocked: ['firstStep'],
      visitedProjects: ['a'],
      footprints: 42,
      lastUnlocked: 'firstStep',
    })

    expect(loadGameState()).toEqual({
      unlocked: ['firstStep'],
      visitedProjects: ['a'],
      footprints: 42,
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
      JSON.stringify({ gameMode: false, unlocked: ['contact'] }),
    )

    expect(loadGameState()).toEqual({
      ...initialGameState,
      unlocked: ['contact'],
    })
  })

  it('drops unknown figurines and malformed fields', () => {
    localStorage.setItem(
      'game',
      JSON.stringify({
        unlocked: ['contact', 'hacker'],
        visitedProjects: [42, 'b'],
        footprints: -3,
      }),
    )

    expect(loadGameState()).toEqual({
      ...initialGameState,
      unlocked: ['contact'],
      visitedProjects: ['b'],
      footprints: 0,
    })
  })

  it('drops the retired Reader figurine from an older save', () => {
    localStorage.setItem(
      'game',
      JSON.stringify({ unlocked: ['reader', 'polyglot'] }),
    )

    expect(loadGameState().unlocked).toEqual(['polyglot'])
  })

  it('keeps Eclipse from a save of when it was a secret', () => {
    localStorage.setItem('game', JSON.stringify({ unlocked: ['secret'] }))

    expect(loadGameState().unlocked).toEqual(['eclipse'])
  })
})
