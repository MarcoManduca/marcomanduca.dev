import { renderHook } from '@testing-library/react'

import { useAuth as useOidcAuth } from 'react-oidc-context'

import { useAuth } from './useAuth'

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/utils/env', () => ({
  ADMIN_GROUP: 'Administrators',
  COGNITO_CLIENT_ID: 'test-client',
  COGNITO_DOMAIN: 'https://auth.test',
}))

const mockedOidc = vi.mocked(useOidcAuth)

interface OidcStub {
  isLoading?: boolean
  isAuthenticated?: boolean
  profile?: Record<string, unknown>
}

const stubOidc = ({
  isLoading = false,
  isAuthenticated = false,
  profile,
}: OidcStub) => {
  const removeUser = vi.fn()
  mockedOidc.mockReturnValue({
    isLoading,
    isAuthenticated,
    user: profile ? { profile } : null,
    signinRedirect: vi.fn(),
    removeUser,
  } as unknown as ReturnType<typeof useOidcAuth>)
  return { removeUser }
}

describe('useAuth', () => {
  it('flags users in the Administrators group as admins', () => {
    stubOidc({
      isAuthenticated: true,
      profile: {
        email: 'admin@example.com',
        'cognito:groups': ['Administrators'],
      },
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(true)
    expect(result.current.userName).toBe('admin@example.com')
  })

  it('does not flag users outside the Administrators group', () => {
    stubOidc({
      isAuthenticated: true,
      profile: { sub: 'user-1' },
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isAdmin).toBe(false)
    expect(result.current.userName).toBe('user-1')
  })

  it('reports an anonymous, loading state with no user', () => {
    stubOidc({ isLoading: true })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userName).toBeNull()
  })

  it('clears local tokens and redirects to the Cognito logout endpoint', () => {
    const assign = vi.fn()
    vi.stubGlobal('location', { origin: 'https://site.test', assign })
    const { removeUser } = stubOidc({
      isAuthenticated: true,
      profile: { email: 'admin@example.com' },
    })

    const { result } = renderHook(() => useAuth())
    result.current.signOut()

    expect(removeUser).toHaveBeenCalledOnce()
    expect(assign).toHaveBeenCalledWith(
      'https://auth.test/logout?client_id=test-client&logout_uri=https%3A%2F%2Fsite.test%2F',
    )

    vi.unstubAllGlobals()
  })
})
