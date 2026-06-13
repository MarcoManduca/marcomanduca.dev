import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { Header } from './Header'

describe('Header', () => {
  it('renders the brand link, navigation and language switcher', () => {
    renderWithProviders(<Header />)

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    )
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
  })

  it('opens and closes the mobile menu via the toggle button', async () => {
    renderWithProviders(<Header />)

    await userEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(
      screen.getByRole('navigation', { name: 'Mobile' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(
      screen.queryByRole('navigation', { name: 'Mobile' }),
    ).not.toBeInTheDocument()
  })
})
