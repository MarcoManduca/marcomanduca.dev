import { renderHook } from '@testing-library/react'

import { useAuth as useOidcAuth } from 'react-oidc-context'

import { useAuth } from './useAuth'

vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
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
  mockedOidc.mockReturnValue({
    isLoading,
    isAuthenticated,
    user: profile ? { profile } : null,
    signinRedirect: vi.fn(),
    removeUser: vi.fn(),
  } as unknown as ReturnType<typeof useOidcAuth>)
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
})
