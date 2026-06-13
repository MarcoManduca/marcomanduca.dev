import { makeStore } from '@/store'
import { articlesFixture, versionsFixture } from '@/test/mocks/fixtures'

import { learningApi } from './learningApi'

describe('learningApi', () => {
  it('fetches the article list as a bare array', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      learningApi.endpoints.getArticles.initiate(),
    )

    expect(result.status).toBe('fulfilled')
    expect(result.data).toHaveLength(articlesFixture.length)
    expect(result.data?.[0].slug).toBe('big-o-notation')
  })

  it('fetches the version history as a bare array', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      learningApi.endpoints.getArticleVersions.initiate('big-o-notation'),
    )

    expect(result.status).toBe('fulfilled')
    expect(result.data).toHaveLength(versionsFixture.length)
    expect(result.data?.[0].updated_at).toBe('2026-04-20T09:00:00Z')
  })

  it('rolls an article back to a previous version', async () => {
    const store = makeStore()

    const result = await store.dispatch(
      learningApi.endpoints.rollbackArticle.initiate({
        slug: 'big-o-notation',
        version: 2,
      }),
    )

    expect('data' in result).toBe(true)
    if ('data' in result) {
      expect(result.data?.slug).toBe('big-o-notation')
      expect(result.data?.version).toBe(4)
    }
  })
})
