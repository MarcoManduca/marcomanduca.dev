import { HttpResponse, http, type JsonBodyType } from 'msw'
import { ErrorResponse, type User } from 'oidc-client-ts'

import { makeStore } from '@/store'
import { projectsFixture, technologiesFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

import { projectsApi } from './projectsApi'
import { technologiesApi } from './technologiesApi'
import { userManager } from './userManager'

const STORAGE_KEY = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`
const nowSeconds = () => Math.floor(Date.now() / 1000)

const storeUser = (
  token: string,
  expiresAt: number,
  refreshToken: string | null = 'refresh',
) =>
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      access_token: token,
      refresh_token: refreshToken,
      expires_at: expiresAt,
    }),
  )

/**
 * Record the Authorization headers seen on `path`: bearer tokens in
 * `rejected` get a 401, anything else (including no token) succeeds.
 */
const recordAuth = (path: string, body: JsonBodyType, rejected: string[]) => {
  const seen: (string | null)[] = []
  server.use(
    http.get(`${API_URL}${path}`, ({ request }) => {
      const header = request.headers.get('Authorization')
      seen.push(header)
      return header && rejected.includes(header)
        ? HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
        : HttpResponse.json(body)
    }),
  )
  return seen
}

/** Make the silent refresh store `token`, as a refresh-token grant would. */
const refreshTo = (token: string) =>
  vi.spyOn(userManager, 'signinSilent').mockImplementation(async () => {
    storeUser(token, nowSeconds() + 3600)
    return { access_token: token } as User
  })

const failRefresh = (
  error: Error = new ErrorResponse({ error: 'invalid_grant' }),
) => vi.spyOn(userManager, 'signinSilent').mockRejectedValue(error)

const getProjects = () =>
  makeStore().dispatch(projectsApi.endpoints.getProjects.initiate())

describe('api base query', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('sends a valid token as a bearer header', async () => {
    const seen = recordAuth('/projects', projectsFixture, [])
    storeUser('valid', nowSeconds() + 3600)

    await getProjects()

    expect(seen).toEqual(['Bearer valid'])
  })

  it('never sends an expired token', async () => {
    const seen = recordAuth('/projects', projectsFixture, ['Bearer stale'])
    storeUser('stale', nowSeconds() - 60, null)

    const result = await getProjects()

    expect(result.status).toBe('fulfilled')
    expect(seen).toEqual([null])
  })

  it('renews an expired stored token before sending', async () => {
    const seen = recordAuth('/projects', projectsFixture, ['Bearer stale'])
    storeUser('stale', nowSeconds() - 60)
    refreshTo('fresh')

    await getProjects()

    expect(seen).toEqual(['Bearer fresh'])
  })

  it('ends a session whose expired token cannot be renewed', async () => {
    const seen = recordAuth('/projects', projectsFixture, [])
    storeUser('stale', nowSeconds() - 60)
    failRefresh()

    await getProjects()

    expect(seen).toEqual([null])
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('keeps the session when the refresh fails for a network error', async () => {
    recordAuth('/projects', projectsFixture, ['Bearer revoked'])
    storeUser('revoked', nowSeconds() + 3600)
    failRefresh(new TypeError('Failed to fetch'))
    const removeUser = vi.spyOn(userManager, 'removeUser')

    const result = await getProjects()

    expect(result.error).toMatchObject({ status: 401 })
    expect(removeUser).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('refreshes a rejected token and retries with the new one', async () => {
    const seen = recordAuth('/projects', projectsFixture, ['Bearer revoked'])
    storeUser('revoked', nowSeconds() + 3600)
    refreshTo('fresh')

    const result = await getProjects()

    expect(result.status).toBe('fulfilled')
    expect(seen).toEqual(['Bearer revoked', 'Bearer fresh'])
  })

  it('ends the session and retries anonymously when the refresh fails', async () => {
    const seen = recordAuth('/projects', projectsFixture, ['Bearer revoked'])
    storeUser('revoked', nowSeconds() + 3600)
    failRefresh()
    const removeUser = vi.spyOn(userManager, 'removeUser')

    const result = await getProjects()

    expect(result.status).toBe('fulfilled')
    expect(result.data).toHaveLength(projectsFixture.length)
    expect(seen).toEqual(['Bearer revoked', null])
    expect(removeUser).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('ends the session when the refreshed token is rejected too', async () => {
    const seen = recordAuth('/projects', projectsFixture, [
      'Bearer revoked',
      'Bearer fresh',
    ])
    storeUser('revoked', nowSeconds() + 3600)
    refreshTo('fresh')

    const result = await getProjects()

    expect(result.status).toBe('fulfilled')
    expect(seen).toEqual(['Bearer revoked', 'Bearer fresh', null])
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('shares one refresh between requests rejected at the same time', async () => {
    recordAuth('/projects', projectsFixture, ['Bearer revoked'])
    recordAuth('/technologies', technologiesFixture, ['Bearer revoked'])
    storeUser('revoked', nowSeconds() + 3600)
    const signinSilent = refreshTo('fresh')
    const store = makeStore()

    await Promise.all([
      store.dispatch(projectsApi.endpoints.getProjects.initiate()),
      store.dispatch(technologiesApi.endpoints.getTechnologies.initiate()),
    ])

    expect(signinSilent).toHaveBeenCalledOnce()
  })

  it('does not retry a 401 for an anonymous request', async () => {
    let calls = 0
    server.use(
      http.get(`${API_URL}/projects`, () => {
        calls += 1
        return HttpResponse.json({ detail: 'Unauthorized' }, { status: 401 })
      }),
    )

    const result = await getProjects()

    expect(result.error).toMatchObject({ status: 401 })
    expect(calls).toBe(1)
  })
})
