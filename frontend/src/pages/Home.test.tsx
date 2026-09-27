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
      screen.getByRole('link', { name: 'Full journey →' }),
    ).toHaveAttribute('href', '/about-me')
  })

  it('renders the stats radar and the side quests deck', async () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('heading', { name: 'Statistics' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Side Quests' })).toBeVisible()
    expect(await screen.findByText('SQ: 01/02')).toBeInTheDocument()
  })

  it('links to the projects once, from the side quests', () => {
    renderWithProviders(<Home />)

    const links = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href') === '/projects')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('All projects →')
  })

  it('always shows the figurine collection', () => {
    renderWithProviders(<Home />)

    expect(screen.getByRole('heading', { name: 'Collection' })).toBeVisible()
  })
})
