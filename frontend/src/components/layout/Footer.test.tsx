import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the current year and the copyright line', () => {
    renderWithProviders(<Footer />)

    const year = String(new Date().getFullYear())
    expect(
      screen.getByText(new RegExp(`${year} Marco Manduca`)),
    ).toBeInTheDocument()
  })

  it('links to the privacy policy', () => {
    renderWithProviders(<Footer />)

    expect(
      screen.getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/privacy-policy')
  })
})
