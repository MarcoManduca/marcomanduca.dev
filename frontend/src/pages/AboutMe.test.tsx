import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { AboutMe } from './AboutMe'

describe('AboutMe', () => {
  it('renders the bio, experience timeline and skill groups', () => {
    renderWithProviders(<AboutMe />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'About me' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Experience' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeInTheDocument()
  })

  it('lists experience entries and individual skills', () => {
    renderWithProviders(<AboutMe />)

    expect(screen.getByText('2023 — Present')).toBeInTheDocument()
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0)
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})
