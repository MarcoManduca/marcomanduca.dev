import type { ReactNode } from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'
import { ErrorResponse, type User } from 'oidc-client-ts'
import { AuthProvider, useAuth } from 'react-oidc-context'

import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

import { endSession, refreshSession } from './session'
import { userManager } from './userManager'

const STORAGE_KEY = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`

const storeSignedInUser = (refreshToken: string | null = 'refresh') =>
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      access_token: 'token',
      refresh_token: refreshToken,
      token_type: 'Bearer',
      profile: { sub: 'admin', 'cognito:groups': ['Administrators'] },
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    }),
  )

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider userManager={userManager} skipSigninCallback>
    {children}
  </AuthProvider>
)

describe('session', () => {
  afterEach(() => {
    sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('reports a successful silent refresh', async () => {
    storeSignedInUser()
    vi.spyOn(userManager, 'signinSilent').mockResolvedValue({} as User)

    await expect(refreshSession()).resolves.toBe('renewed')
  })

  it('reports a refresh the token endpoint refused as rejected', async () => {
    storeSignedInUser()
    vi.spyOn(userManager, 'signinSilent').mockRejectedValue(
      new ErrorResponse({ error: 'invalid_grant' }),
    )

    await expect(refreshSession()).resolves.toBe('rejected')
  })

  it('reports a network failure as unavailable, keeping the session', async () => {
    storeSignedInUser()
    vi.spyOn(userManager, 'signinSilent').mockRejectedValue(
      new TypeError('Failed to fetch'),
    )

    await expect(refreshSession()).resolves.toBe('unavailable')
  })

  it('rejects without calling Cognito when there is no refresh token', async () => {
    storeSignedInUser(null)
    const signinSilent = vi.spyOn(userManager, 'signinSilent')

    await expect(refreshSession()).resolves.toBe('rejected')
    expect(signinSilent).not.toHaveBeenCalled()
  })

  it('shares one silent refresh between concurrent callers', async () => {
    storeSignedInUser()
    const signinSilent = vi
      .spyOn(userManager, 'signinSilent')
      .mockResolvedValue({} as User)

    await Promise.all([refreshSession(), refreshSession()])

    expect(signinSilent).toHaveBeenCalledOnce()
  })

  it('signs the auth context out when the session ends', async () => {
    storeSignedInUser()
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true))

    await act(() => endSession())

    expect(result.current.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('ends the session quietly when storage is unavailable', async () => {
    vi.spyOn(userManager, 'removeUser').mockRejectedValue(new Error('blocked'))

    await expect(endSession()).resolves.toBeUndefined()
  })
})
