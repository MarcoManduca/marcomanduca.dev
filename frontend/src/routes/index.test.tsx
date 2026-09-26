import { screen } from '@testing-library/react'

import type { AuthState } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/utils'

import { AppRoutes } from './index'

const mockUseAuth = vi.fn<() => AuthState>()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}))

const adminAuth: AuthState = {
  isLoading: false,
  isAuthenticated: true,
  isAdmin: true,
  error: null,
  userName: 'admin@example.com',
  signIn: vi.fn(),
  signOut: vi.fn(),
}

describe('AppRoutes', () => {
  it('renders the home page on the root route', () => {
    mockUseAuth.mockReturnValue(adminAuth)
    renderWithProviders(<AppRoutes />, { route: '/' })

    expect(
      screen.getByRole('heading', { name: 'Marco Manduca' }),
    ).toBeInTheDocument()
  })

  it('renders the not found page on an unknown route', () => {
    mockUseAuth.mockReturnValue(adminAuth)
    renderWithProviders(<AppRoutes />, { route: '/nope' })

    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('lazy-loads the public detail pages', async () => {
    mockUseAuth.mockReturnValue(adminAuth)
    renderWithProviders(<AppRoutes />, { route: '/projects/data-pipeline' })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Data pipeline' }),
    ).toBeInTheDocument()
  })

  it('lazy-loads the privacy policy page', async () => {
    mockUseAuth.mockReturnValue(adminAuth)
    renderWithProviders(<AppRoutes />, { route: '/privacy-policy' })

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Privacy Policy' }),
    ).toBeInTheDocument()
  })

  it('renders the admin dashboard for an administrator', async () => {
    mockUseAuth.mockReturnValue(adminAuth)
    renderWithProviders(<AppRoutes />, { route: '/admin' })

    expect(
      await screen.findByRole('navigation', { name: 'Admin' }),
    ).toBeInTheDocument()
  })

  it('blocks the admin area for non-admins', () => {
    mockUseAuth.mockReturnValue({ ...adminAuth, isAdmin: false })
    renderWithProviders(<AppRoutes />, { route: '/admin' })

    expect(screen.getByText('Access denied')).toBeInTheDocument()
  })
})
