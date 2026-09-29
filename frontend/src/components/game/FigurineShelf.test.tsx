import { act, screen, within } from '@testing-library/react'

import { leaveFootprint } from '@/store/gameSlice'
import { renderWithProviders } from '@/test/utils'

import { FigurineShelf } from './FigurineShelf'

const tile = (name: RegExp) =>
  screen
    .getAllByRole('listitem')
    .find((item) => name.test(item.textContent ?? ''))

describe('FigurineShelf', () => {
  it('lists every figurine with the collection count', () => {
    renderWithProviders(<FigurineShelf />, {
      game: { unlocked: ['firstStep', 'contact'] },
    })

    expect(screen.getByRole('heading', { name: 'Collection' })).toBeVisible()
    expect(screen.getAllByRole('listitem')).toHaveLength(7)
    expect(screen.getByText('2/7')).toBeInTheDocument()
    expect(screen.queryByText('Reader')).not.toBeInTheDocument()
    expect(
      within(tile(/First step/)!).getByText('Unlocked'),
    ).toBeInTheDocument()
    expect(within(tile(/Polyglot/)!).getByText('Locked')).toBeInTheDocument()
  })

  it('shows the progress of the figurines earned with a goal', () => {
    renderWithProviders(<FigurineShelf />, {
      game: { visitedProjects: ['a'], footprints: 420 },
    })

    expect(screen.getByText('Explorer 1/3')).toBeInTheDocument()
    expect(screen.getByText('Level Up 420/1000')).toBeInTheDocument()
    expect(
      screen.getByText('Leave 1000 footprints with the mouse'),
    ).toBeInTheDocument()
  })

  it('names every figurine and its hint before it is unlocked', () => {
    renderWithProviders(<FigurineShelf />)

    expect(
      within(tile(/Eclipse/)!).getByText('Switch the site theme'),
    ).toBeInTheDocument()
    expect(within(tile(/Eclipse/)!).getByText('Locked')).toBeInTheDocument()
  })

  it('drops the progress once a goal figurine is unlocked', () => {
    renderWithProviders(<FigurineShelf />, {
      game: { unlocked: ['levelUp'], footprints: 1000 },
    })

    expect(within(tile(/Level Up/)!).getByText('Unlocked')).toBeInTheDocument()
    expect(screen.queryByText(/1000\/1000/)).not.toBeInTheDocument()
  })

  it('follows the footprints left while it is on screen', () => {
    const { store } = renderWithProviders(<FigurineShelf />, {
      game: { footprints: 420 },
    })

    act(() => {
      store.dispatch(leaveFootprint())
    })

    expect(screen.getByText('Level Up 421/1000')).toBeInTheDocument()
  })
})
