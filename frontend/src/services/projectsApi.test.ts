import { makeStore } from '@/store'
import { projectsFixture } from '@/test/mocks/fixtures'

import { projectsApi } from './projectsApi'

describe('projectsApi', () => {
  it('fetches the project list from the backend', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      projectsApi.endpoints.getProjects.initiate(),
    )

    expect(result.status).toBe('fulfilled')
    expect(result.data).toHaveLength(projectsFixture.length)
    expect(result.data?.[0].slug).toBe('data-pipeline')
  })

  it('fetches a single project by slug', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      projectsApi.endpoints.getProjectBySlug.initiate('portfolio-site'),
    )

    expect(result.status).toBe('fulfilled')
    expect(result.data?.title.en).toBe('Portfolio site')
  })

  it('returns a 404 error for an unknown slug', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      projectsApi.endpoints.getProjectBySlug.initiate('missing'),
    )

    expect(result.status).toBe('rejected')
    expect(result.error).toMatchObject({ status: 404 })
  })
})
