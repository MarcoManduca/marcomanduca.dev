import type { ReactNode } from 'react'

import { act, renderHook, waitFor } from '@testing-library/react'
import type { User } from 'oidc-client-ts'
import { AuthProvider, useAuth } from 'react-oidc-context'

import { COGNITO_AUTHORITY, COGNITO_CLIENT_ID } from '@/utils/env'

import { endSession, refreshSession } from './session'
import { userManager } from './userManager'

const STORAGE_KEY = `oidc.user:${COGNITO_AUTHORITY}:${COGNITO_CLIENT_ID}`

const storeSignedInUser = () =>
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      access_token: 'token',
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
    vi.spyOn(userManager, 'signinSilent').mockResolvedValue({} as User)

    await expect(refreshSession()).resolves.toBe(true)
  })

  it('reports a failed silent refresh without throwing', async () => {
    vi.spyOn(userManager, 'signinSilent').mockRejectedValue(
      new Error('expired'),
    )

    await expect(refreshSession()).resolves.toBe(false)
  })

  it('shares one silent refresh between concurrent callers', async () => {
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
