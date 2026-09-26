import { endYear } from './endYear'

describe('endYear', () => {
  it.each([
    ['Settembre 2019 — Novembre 2020', 2020],
    ['April 2024 — April 2025', 2025],
    ['2019', 2019],
  ])('reads the closing year of "%s"', (period, expected) => {
    expect(endYear(period)).toBe(expected)
  })

  it('returns undefined when the period has no year', () => {
    expect(endYear('Oggi')).toBeUndefined()
  })
})
