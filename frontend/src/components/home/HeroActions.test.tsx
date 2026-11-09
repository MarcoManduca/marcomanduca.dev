import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { HeroActions } from './HeroActions'

describe('HeroActions', () => {
  it('pitches the role in one line', () => {
    renderWithProviders(<HeroActions />)

    expect(
      screen.getByText(/I design the path from raw data to decisions/),
    ).toBeVisible()
  })

  it('offers the CV, LinkedIn and the contact form', () => {
    renderWithProviders(<HeroActions />)

    expect(
      screen.getByRole('button', { name: 'Download CV' }),
    ).toBeInTheDocument()
    const linkedin = screen.getByRole('link', { name: /LinkedIn/ })
    expect(linkedin).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/marco-manduca/',
    )
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByRole('link', { name: 'Contact me' })).toHaveAttribute(
      'href',
      '/contacts',
    )
  })
})
