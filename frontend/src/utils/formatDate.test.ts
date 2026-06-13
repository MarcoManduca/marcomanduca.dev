import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats an ISO date in English', () => {
    expect(formatDate('2026-06-12T10:00:00Z', 'en')).toBe('12 June 2026')
  })

  it('formats an ISO date in Italian', () => {
    expect(formatDate('2026-06-12T10:00:00Z', 'it')).toBe('12 giugno 2026')
  })

  it('returns an empty string for invalid input', () => {
    expect(formatDate('not-a-date', 'en')).toBe('')
  })
})
