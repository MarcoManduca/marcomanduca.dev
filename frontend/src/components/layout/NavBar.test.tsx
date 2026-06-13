import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { NavBar } from './NavBar'

describe('NavBar', () => {
  it('renders every primary navigation link', () => {
    renderWithProviders(<NavBar />)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'About me' })).toHaveAttribute(
      'href',
      '/about-me',
    )
    expect(screen.getByRole('link', { name: 'CV' })).toHaveAttribute(
      'href',
      '/cv',
    )
  })

  it('marks the active route', () => {
    renderWithProviders(<NavBar />, { route: '/projects' })

    expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass(
      'text-accent-hover',
    )
  })
})
