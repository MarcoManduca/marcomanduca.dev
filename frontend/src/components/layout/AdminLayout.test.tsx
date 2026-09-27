import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'

import type { AuthState } from '@/hooks/useAuth'
import { renderWithProviders } from '@/test/utils'

import { AdminLayout } from './AdminLayout'

const signOut = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: (): AuthState => ({
    isLoading: false,
    isAuthenticated: true,
    isAdmin: true,
    error: null,
    userName: 'admin@example.com',
    signIn: vi.fn(),
    signOut,
  }),
}))

const renderLayout = () =>
  renderWithProviders(
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<p>Dashboard body</p>} />
      </Route>
    </Routes>,
    { route: '/admin' },
  )

describe('AdminLayout', () => {
  it('renders the admin nav, the signed-in user and the outlet', () => {
    renderLayout()

    expect(
      screen.getByRole('navigation', { name: 'Admin' }),
    ).toBeInTheDocument()
    expect(screen.getByText('admin@example.com')).toBeInTheDocument()
    expect(screen.getByText('Dashboard body')).toBeInTheDocument()
  })

  it('signs the user out on click', async () => {
    renderLayout()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(signOut).toHaveBeenCalledOnce()
  })
})
