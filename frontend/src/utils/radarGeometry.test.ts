import {
  RADAR_CENTER,
  radarLabel,
  radarPoint,
  radarPolygon,
} from './radarGeometry'

describe('radarGeometry', () => {
  it('starts the first axis at the top and turns clockwise', () => {
    expect(radarPoint(0, 6, 1)).toEqual({ x: 180, y: 45 })
    expect(radarPoint(1, 6, 1)).toEqual({ x: 270.9, y: 97.5 })
    expect(radarPoint(3, 6, 1)).toEqual({ x: 180, y: 255 })
  })

  it('places a level along its axis, out from the centre', () => {
    expect(radarPoint(0, 6, 0)).toEqual(RADAR_CENTER)
    expect(radarPoint(0, 6, 0.5)).toEqual({ x: 180, y: 97.5 })
  })

  it('draws the polygon through every axis in order', () => {
    expect(radarPolygon([1, 1, 1, 1])).toBe('180,45 285,150 180,255 75,150')
  })

  it.each([
    [0, 'middle'],
    [1, 'start'],
    [2, 'start'],
    [3, 'middle'],
    [4, 'end'],
    [5, 'end'],
  ] as const)('anchors the label of axis %i at its %s', (index, anchor) => {
    expect(radarLabel(index, 6).anchor).toBe(anchor)
  })

  it('keeps the labels outside the outer ring', () => {
    expect(radarLabel(0, 6).y).toBeLessThan(45)
    expect(radarLabel(3, 6).y).toBeGreaterThan(255)
    expect(radarLabel(1, 6).x).toBeGreaterThan(270.9)
    expect(radarLabel(5, 6).x).toBeLessThan(89.1)
  })
})
