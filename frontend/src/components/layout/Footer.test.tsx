import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Footer } from './Footer'

describe('Footer', () => {
  it('renders the current year and the built-with note', () => {
    renderWithProviders(<Footer />)

    const year = String(new Date().getFullYear())
    expect(
      screen.getByText(new RegExp(`${year} Marco Manduca`)),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Built with React, FastAPI and AWS.'),
    ).toBeInTheDocument()
  })
})
