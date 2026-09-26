import { screen, within } from '@testing-library/react'

import { renderWithProviders } from '@/test/utils'

import { FigurineShelf } from './FigurineShelf'

const tile = (name: RegExp) =>
  screen
    .getAllByRole('listitem')
    .find((item) => name.test(item.textContent ?? ''))

describe('FigurineShelf', () => {
  it('lists every figurine with the collection count', () => {
    renderWithProviders(<FigurineShelf />, {
      game: { unlocked: ['firstStep', 'reader'] },
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.getByText('2/6')).toBeInTheDocument()
    expect(
      within(tile(/First step/)!).getByText('Unlocked'),
    ).toBeInTheDocument()
    expect(within(tile(/Polyglot/)!).getByText('Locked')).toBeInTheDocument()
  })

  it('shows explorer progress and hides the secret until unlocked', () => {
    renderWithProviders(<FigurineShelf />, {
      game: { visitedProjects: ['a'] },
    })

    expect(screen.getByText('Explorer 1/3')).toBeInTheDocument()
    expect(screen.getByText('???')).toBeInTheDocument()
    expect(screen.queryByText('Eclipse')).not.toBeInTheDocument()
  })

  it('reveals the secret once unlocked', () => {
    renderWithProviders(<FigurineShelf />, { game: { unlocked: ['secret'] } })

    expect(screen.getByText('Eclipse')).toBeInTheDocument()
  })

  it('renders nothing outside game mode', () => {
    const { container } = renderWithProviders(<FigurineShelf />, {
      game: { gameMode: false },
    })

    expect(container).toBeEmptyDOMElement()
  })
})
