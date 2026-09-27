import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse, http } from 'msw'

import { projectsFixture } from '@/test/mocks/fixtures'
import { API_URL } from '@/test/mocks/handlers'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/utils'

import { SideQuestsSection } from './SideQuestsSection'

const deck = () => screen.getByRole('group', { name: 'Side Quests' })

/** The card on top of the deck, the only one not hidden from assistive tech. */
const topCard = () =>
  deck().querySelector<HTMLElement>(':scope > [aria-hidden="false"]')!

const dragTopCard = (dx: number) => {
  const card = topCard()
  fireEvent.pointerDown(card, { clientX: 100, button: 0 })
  fireEvent.pointerMove(card, { clientX: 100 + dx / 2 })
  fireEvent.pointerMove(card, { clientX: 100 + dx })
  fireEvent.pointerUp(card, { clientX: 100 + dx })
}

describe('SideQuestsSection', () => {
  it('deals the published projects oldest first, numbered SQ: NN/total', async () => {
    renderWithProviders(<SideQuestsSection />)

    expect(await screen.findByText('SQ: 01/02')).toBeInTheDocument()
    expect(screen.getByText('SQ: 02/02')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 3, name: 'Data pipeline' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Card 1 of 3: Data pipeline')).toBeInTheDocument()
  })

  it('links the top card to its project page and source code', async () => {
    renderWithProviders(<SideQuestsSection />)

    expect(
      await screen.findByRole('link', { name: 'Open the quest →' }),
    ).toHaveAttribute('href', '/projects/data-pipeline')
    expect(
      screen.getByRole('link', { name: 'Source code on GitHub' }),
    ).toHaveAttribute('href', 'https://github.com/example/data-pipeline')
  })

  it('closes the deck with a face-down card asking for the next quest', async () => {
    renderWithProviders(<SideQuestsSection />)

    expect(await screen.findByText('[Next side quest]')).toBeInTheDocument()
    expect(screen.getByText('Get in touch →').closest('a')).toHaveAttribute(
      'href',
      '/contacts',
    )
  })

  it('flips to the next card when the top card is dragged away', async () => {
    renderWithProviders(<SideQuestsSection />)
    await screen.findByText('SQ: 01/02')

    dragTopCard(-160)

    expect(
      await screen.findByText('Card 2 of 3: Portfolio site'),
    ).toBeInTheDocument()
  })

  it('lets a short drag settle back on top', async () => {
    renderWithProviders(<SideQuestsSection />)
    await screen.findByText('SQ: 01/02')

    dragTopCard(40)

    expect(screen.getByText('Card 1 of 3: Data pipeline')).toBeInTheDocument()
  })

  it('flips through the deck with the arrow keys', async () => {
    renderWithProviders(<SideQuestsSection />)
    await screen.findByText('SQ: 01/02')
    deck().focus()

    await userEvent.keyboard('{ArrowLeft}')
    expect(
      screen.getByText('Card 3 of 3: [Next side quest]'),
    ).toBeInTheDocument()

    await userEvent.keyboard('{ArrowRight}')
    expect(
      await screen.findByText('Card 1 of 3: Data pipeline'),
    ).toBeInTheDocument()
  })

  it('keeps drafts off the Home', async () => {
    server.use(
      http.get(`${API_URL}/projects`, () =>
        HttpResponse.json([
          ...projectsFixture,
          { ...projectsFixture[0], slug: 'draft', status: 'draft' },
        ]),
      ),
    )
    renderWithProviders(<SideQuestsSection />)

    expect(await screen.findByText('SQ: 02/02')).toBeInTheDocument()
    expect(screen.queryByText('SQ: 03/03')).not.toBeInTheDocument()
  })

  it('still offers the face-down card when projects fail to load', async () => {
    server.use(
      http.get(`${API_URL}/projects`, () =>
        HttpResponse.json({ detail: 'down' }, { status: 500 }),
      ),
    )
    renderWithProviders(<SideQuestsSection />)

    expect(
      await screen.findByText('Card 1 of 1: [Next side quest]'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/^SQ:/)).not.toBeInTheDocument()
    expect(
      screen.queryByText('Drag the card to flip through the deck'),
    ).not.toBeInTheDocument()
  })
})
