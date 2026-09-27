import { timelineAnchor } from './timelineAnchor'

describe('timelineAnchor', () => {
  it('builds the id from the entry kind and start month', () => {
    expect(timelineAnchor('work', '2020-11')).toBe('work-2020-11')
    expect(timelineAnchor('study', '2025-09')).toBe('study-2025-09')
  })
})
