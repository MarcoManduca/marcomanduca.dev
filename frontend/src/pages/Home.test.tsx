import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { Home } from './Home'

describe('Home', () => {
  it('renders the flippable character card as the page heading', () => {
    renderWithProviders(<Home />)

    expect(
      screen.getByRole('article', { name: 'Character card' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 1, name: 'Marco Manduca' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Flip the character card' }),
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
