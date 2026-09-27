import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'

import type { AuthState } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/utils'

import { AuthCallback } from './AuthCallback'

const mockUseAuth = vi.fn<() => AuthState>()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const authState = (overrides: Partial<AuthState>): AuthState => ({
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  error: null,
  userName: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
})

const renderCallback = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/callback" element={<AuthCallback />} />
      <Route path="/admin" element={<div>Admin area</div>} />
      <Route path="/admin/projects" element={<div>Admin projects</div>} />
    </Routes>,
    { route: '/admin/callback' },
  )

describe('AuthCallback', () => {
  it('shows a spinner while the authorization code is exchanged', () => {
    mockUseAuth.mockReturnValue(authState({ isLoading: true }))

    renderCallback()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument()
  })

  it('redirects to the admin area once authentication completes', () => {
    mockUseAuth.mockReturnValue(authState({ isLoading: false }))

    renderCallback()

    expect(screen.getByText('Admin area')).toBeInTheDocument()
  })

  it('shows an error with a retry action instead of redirecting on failure', async () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(
      authState({ error: new Error('exchange failed'), signIn }),
    )

    renderCallback()

    expect(screen.queryByText('Admin area')).not.toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: /try again|riprova/i }),
    )
    expect(signIn).toHaveBeenCalledWith()
  })

  it('returns to the admin page requested before signing in', () => {
    mockUseAuth.mockReturnValue(authState({ returnTo: '/admin/projects' }))

    renderCallback()

    expect(screen.getByText('Admin projects')).toBeInTheDocument()
  })

  it.each([
    'https://evil.example.com/admin',
    '//evil.example.com/admin',
    '/\\evil.example.com/admin',
    '/administrator',
    '/projects',
    '/admin/callback',
  ])('falls back to /admin for the unsafe return path %s', (returnTo) => {
    mockUseAuth.mockReturnValue(authState({ returnTo }))

    renderCallback()

    expect(screen.getByText('Admin area')).toBeInTheDocument()
  })
})
