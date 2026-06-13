import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import type { AuthState } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/utils'

import { ProtectedRoute } from './ProtectedRoute'

const mockUseAuth = vi.fn<() => AuthState>()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const authState = (overrides: Partial<AuthState>): AuthState => ({
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  userName: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
})

const renderProtected = () =>
  renderWithProviders(
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<div>Admin content</div>} />
      </Route>
    </Routes>,
    { route: '/admin' },
  )

describe('ProtectedRoute', () => {
  it('redirects unauthenticated visitors to the Cognito login', () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(authState({ signIn }))

    renderProtected()

    expect(signIn).toHaveBeenCalledOnce()
    expect(screen.getByText('Redirecting to login…')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })

  it('shows a forbidden message for authenticated non-admins', () => {
    mockUseAuth.mockReturnValue(authState({ isAuthenticated: true }))

    renderProtected()

    expect(screen.getByText('Access denied')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })

  it('renders the protected content for administrators', () => {
    mockUseAuth.mockReturnValue(
      authState({ isAuthenticated: true, isAdmin: true }),
    )

    renderProtected()

    expect(screen.getByText('Admin content')).toBeInTheDocument()
  })

  it('shows a spinner while the auth state is loading', () => {
    mockUseAuth.mockReturnValue(authState({ isLoading: true }))

    renderProtected()

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })
})
