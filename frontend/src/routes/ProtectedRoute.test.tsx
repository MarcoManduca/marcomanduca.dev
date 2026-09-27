import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'

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
  error: null,
  userName: null,
  signIn: vi.fn(),
  signOut: vi.fn(),
  ...overrides,
})

const protectedRoutes = (
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route path="/admin" element={<div>Admin content</div>} />
      <Route path="/admin/projects" element={<div>Projects content</div>} />
    </Route>
  </Routes>
)

const renderProtected = (route = '/admin') =>
  renderWithProviders(protectedRoutes, { route })

describe('ProtectedRoute', () => {
  it('redirects unauthenticated visitors to the Cognito login', () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(authState({ signIn }))

    renderProtected()

    expect(signIn).toHaveBeenCalledOnce()
    expect(signIn).toHaveBeenCalledWith('/admin')
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

  it('passes the requested deep link to the sign-in redirect', () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(authState({ signIn }))

    renderProtected('/admin/projects?page=2')

    expect(signIn).toHaveBeenCalledWith('/admin/projects?page=2')
  })

  it('attempts the sign-in redirect only once across re-renders', () => {
    const firstSignIn = vi.fn()
    const secondSignIn = vi.fn()
    mockUseAuth.mockReturnValue(authState({ signIn: firstSignIn }))
    const { rerender } = renderProtected()

    mockUseAuth.mockReturnValue(authState({ signIn: secondSignIn }))
    rerender(protectedRoutes)

    expect(firstSignIn).toHaveBeenCalledOnce()
    expect(secondSignIn).not.toHaveBeenCalled()
  })

  it('shows an error with a retry action instead of redirecting again', async () => {
    const signIn = vi.fn()
    mockUseAuth.mockReturnValue(
      authState({ error: new Error('login_required'), signIn }),
    )
    renderProtected('/admin/projects')

    expect(signIn).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Sign-in failed')

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(signIn).toHaveBeenCalledOnce()
    expect(signIn).toHaveBeenCalledWith('/admin/projects')
  })
})
