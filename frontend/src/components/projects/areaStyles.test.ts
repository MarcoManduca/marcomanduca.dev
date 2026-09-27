import { PROJECT_AREAS } from '@/types'

import { areaStyle } from './areaStyles'

describe('areaStyle', () => {
  it.each([
    ['frontend', 'build'],
    ['backend', 'build'],
    ['cloud', 'build'],
    ['data', 'data'],
    ['ml', 'intelligence'],
    ['dl', 'intelligence'],
    ['ai', 'intelligence'],
  ] as const)('groups %s in the %s family', (area, family) => {
    expect(areaStyle(area).family).toBe(family)
  })

  it('gives a family one frame and chip, and each area its own icon', () => {
    const icons = new Set(PROJECT_AREAS.map((area) => areaStyle(area).icon))

    expect(areaStyle('ml').frame).toBe(areaStyle('ai').frame)
    expect(areaStyle('ml').chip).toBe(areaStyle('dl').chip)
    expect(areaStyle('data').frame).not.toBe(areaStyle('cloud').frame)
    expect(icons.size).toBe(PROJECT_AREAS.length)
  })
})
