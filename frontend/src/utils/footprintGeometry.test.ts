import { distance, footprintAt, footprintSpan } from './footprintGeometry'

describe('distance', () => {
  it('measures the straight line between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5)
  })
})

describe('footprintAt', () => {
  it.each([
    // heading, from, left foot, right foot, toes
    ['right', { x: 0, y: 50 }, { x: 100, y: 44 }, { x: 100, y: 56 }, 90],
    ['down', { x: 100, y: 0 }, { x: 106, y: 50 }, { x: 94, y: 50 }, 180],
    ['up', { x: 100, y: 100 }, { x: 94, y: 50 }, { x: 106, y: 50 }, 0],
  ])(
    'walking %s, sets each foot on its side of the path, toes ahead',
    (_heading, from, left, right, rotate) => {
      const to = { x: 100, y: 50 }

      expect(footprintAt(from, to, 'left')).toEqual({ ...left, rotate })
      expect(footprintAt(from, to, 'right')).toEqual({ ...right, rotate })
    },
  )
})

describe('footprintSpan', () => {
  it('reaches from the toes to the heel of an upright print', () => {
    expect(footprintSpan({ x: 50, y: 50, rotate: 0 })).toEqual([
      { x: 50, y: 40 },
      { x: 50, y: 50 },
      { x: 50, y: 60 },
    ])
  })

  it('turns with the print', () => {
    expect(footprintSpan({ x: 50, y: 50, rotate: 90 })).toEqual([
      { x: 60, y: 50 },
      { x: 50, y: 50 },
      { x: 40, y: 50 },
    ])
  })
})
