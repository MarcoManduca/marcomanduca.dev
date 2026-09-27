import { yearsSince } from './yearsSince'

describe('yearsSince', () => {
  it('counts calendar years from the earliest month', () => {
    const today = new Date(2026, 8, 27)

    expect(yearsSince(['2020-11', '2019-09'], today)).toBe(7)
  })

  it('grows on the first of January, whatever the start month', () => {
    const months = ['2019-09']

    expect(yearsSince(months, new Date(2026, 11, 31))).toBe(7)
    expect(yearsSince(months, new Date(2027, 0, 1))).toBe(8)
  })
})
