import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { AboutMe } from './AboutMe'

describe('AboutMe', () => {
  it('renders the bio, experience, education and skill sections', () => {
    renderWithProviders(<AboutMe />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'About me' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Experience' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Education' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: 'Skills' }),
    ).toBeInTheDocument()
  })

  it('lists experience, education and individual skills', () => {
    renderWithProviders(<AboutMe />)

    expect(screen.getByText('November 2020 — Present')).toBeInTheDocument()
    expect(screen.getByText('MSc in Data Science')).toBeInTheDocument()
    expect(screen.getAllByText('Python').length).toBeGreaterThan(0)
    expect(screen.getByText('Power BI')).toBeInTheDocument()
  })

  it('renders the CV download button', () => {
    renderWithProviders(<AboutMe />)

    expect(
      screen.getByRole('button', { name: 'Download CV' }),
    ).toBeInTheDocument()
  })
})
