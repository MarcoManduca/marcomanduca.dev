import { HttpResponse, http } from 'msw'

import { makeStore } from '@/store'
import { projectsFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

import { projectsApi } from './projectsApi'

const STORAGE_KEY = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`
const nowSeconds = () => Math.floor(Date.now() / 1000)

const storeUser = (token: string, expiresAt: number) =>
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ access_token: token, expires_at: expiresAt }),
  )

/** Record the Authorization headers seen and reject any bearer token. */
const rejectTokens = () => {
  const seen: (string | null)[] = []
  server.use(
    http.get(`${API_URL}/projects`, ({ request }) => {
      const header = request.headers.get('Authorization')
      seen.push(header)
      return header
        ? HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        : HttpResponse.json(projectsFixture)
    }),
  )
  return seen
}

describe('api base query', () => {
  afterEach(() => sessionStorage.clear())

  it('sends a valid token as a bearer header', async () => {
    const seen: (string | null)[] = []
    server.use(
      http.get(`${API_URL}/projects`, ({ request }) => {
        seen.push(request.headers.get('Authorization'))
        return HttpResponse.json(projectsFixture)
      }),
    )
    storeUser('valid', nowSeconds() + 3600)

    await makeStore().dispatch(projectsApi.endpoints.getProjects.initiate())

    expect(seen).toEqual(['Bearer valid'])
  })

  it('never sends an expired token', async () => {
    const seen = rejectTokens()
    storeUser('stale', nowSeconds() - 60)

    const result = await makeStore().dispatch(
      projectsApi.endpoints.getProjects.initiate(),
    )

    expect(result.status).toBe('fulfilled')
    expect(seen).toEqual([null])
  })

  it('drops a rejected token and retries the request anonymously', async () => {
    const seen = rejectTokens()
    storeUser('revoked', nowSeconds() + 3600)

    const result = await makeStore().dispatch(
      projectsApi.endpoints.getProjects.initiate(),
    )

    expect(result.status).toBe('fulfilled')
    expect(result.data).toHaveLength(projectsFixture.length)
    expect(seen).toEqual(['Bearer revoked', null])
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('does not retry a 401 for an anonymous request', async () => {
    let calls = 0
    server.use(
      http.get(`${API_URL}/projects`, () => {
        calls += 1
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
    )

    const result = await makeStore().dispatch(
      projectsApi.endpoints.getProjects.initiate(),
    )

    expect(result.error).toMatchObject({ status: 401 })
    expect(calls).toBe(1)
  })
})
