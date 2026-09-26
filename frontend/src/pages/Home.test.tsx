import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Home } from './Home'

describe('Home', () => {
  it('renders the character card as the page heading', () => {
    renderWithProviders(<Home />)

    const card = screen.getByRole('article', { name: 'Character card' })
    expect(
      screen.getByRole('heading', { level: 1, name: 'Marco Manduca' }),
    ).toBeInTheDocument()
    expect(card).toHaveTextContent('Type: Data Engineer & Data Scientist')
    expect(card).toHaveTextContent('Level: over 5 years of experience')
    expect(
      screen.getByRole('img', { name: 'Portrait of Marco Manduca' }),
    ).toBeInTheDocument()
  })

  it('renders the quest log with the active quests first', () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('tab', { name: /Active Quests/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(
      screen.getByRole('link', { name: 'Explore projects' }),
    ).toHaveAttribute('href', '/projects')
  })

  it('renders the skill energies from the CV', () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('heading', { name: 'Energies' })).toBeVisible()
    expect(screen.getByText('Python · R · SAS Base')).toBeInTheDocument()
  })

  it('shows the figurines only in game mode', () => {
    const { unmount } = renderWithProviders(<Home />)
    expect(screen.getByRole('heading', { name: 'Figurines' })).toBeVisible()
    unmount()

    renderWithProviders(<Home />, { game: { gameMode: false } })

    expect(
      screen.queryByRole('heading', { name: 'Figurines' }),
    ).not.toBeInTheDocument()
  })
})
