import { screen } from '@testing-library/react'

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
})
