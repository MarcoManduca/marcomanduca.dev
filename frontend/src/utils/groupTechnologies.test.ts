import type { Technology } from '@/types'

import { groupTechnologies } from './groupTechnologies'

const tech = (name: string, category: string): Technology => ({
  id: name.toLowerCase(),
  name,
  icon: name.toLowerCase(),
  category,
})

describe('groupTechnologies', () => {
  it('groups by category in the order of the first technology', () => {
    const registry = [
      tech('Python', 'language'),
      tech('TensorFlow', 'ml'),
      tech('Keras', 'ml'),
    ]

    expect(
      groupTechnologies(['TensorFlow', 'Python', 'Keras'], registry),
    ).toEqual([
      { category: 'ml', names: ['TensorFlow', 'Keras'] },
      { category: 'language', names: ['Python'] },
    ])
  })

  it('puts technologies missing from the registry under other', () => {
    expect(groupTechnologies(['Fortran'], [])).toEqual([
      { category: 'other', names: ['Fortran'] },
    ])
  })
})
