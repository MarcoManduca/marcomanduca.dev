import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

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

  it('shows an error with a retry action instead of redirecting on failure', () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(
      authState({ error: new Error('exchange failed'), signIn }),
    )

    renderCallback()

    expect(screen.queryByText('Admin area')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /try again|riprova/i }),
    ).toBeInTheDocument()
  })
})
