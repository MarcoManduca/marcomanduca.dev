import { formatMonthYear } from './formatMonthYear'

describe('formatMonthYear', () => {
  it.each([
    ['2020-11', 'it', 'novembre 2020'],
    ['2020-11', 'en', 'November 2020'],
    ['2025-01', 'en', 'January 2025'],
  ] as const)('formats %s in %s', (month, language, expected) => {
    expect(formatMonthYear(month, language)).toBe(expected)
  })
})
