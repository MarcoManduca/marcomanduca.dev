import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { NavBar } from './NavBar'

describe('NavBar', () => {
  it('renders every primary navigation link', () => {
    renderWithProviders(<NavBar />)

    expect(screen.queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'About me' })).toHaveAttribute(
      'href',
      '/about-me',
    )
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'href',
      '/projects',
    )
  })

  it('marks the active route', () => {
    renderWithProviders(<NavBar />, { route: '/projects' })

    expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass(
      'bg-highlight',
    )
  })
})
