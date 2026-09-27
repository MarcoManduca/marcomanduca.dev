import { projectSummariesFixture } from '@/test/mocks/fixtures'
import type { LocalizedText } from '@/types'

import { EMPTY_PROJECT_FILTERS, filterProjects } from './filterProjects'

const english = (text: LocalizedText) => text.en
const slugs = (filters: Partial<typeof EMPTY_PROJECT_FILTERS>) =>
  filterProjects(
    projectSummariesFixture,
    { ...EMPTY_PROJECT_FILTERS, ...filters },
    english,
  ).map(({ slug }) => slug)

describe('filterProjects', () => {
  it('keeps every project when no filter is set', () => {
    expect(slugs({})).toEqual(['data-pipeline', 'portfolio-site'])
  })

  it.each([
    [{ area: 'cloud' as const }, ['data-pipeline']],
    [{ context: 'work' as const }, ['data-pipeline']],
    [{ technology: 'React' }, ['portfolio-site']],
    [{ search: 'SERVERLESS' }, ['data-pipeline']],
    [{ area: 'data' as const, context: 'personal' as const }, []],
  ])('narrows the list with %o', (filters, expected) => {
    expect(slugs(filters)).toEqual(expected)
  })

  it('matches a project under its second area too', () => {
    expect(slugs({ area: 'data' })).toEqual(['data-pipeline'])
  })
})
