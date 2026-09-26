import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { renderWithProviders } from '@/test/utils'

import { CharacterCard } from './CharacterCard'

const faceOf = (element: HTMLElement) =>
  element.closest('[aria-hidden]') as HTMLElement

const cardControl = () =>
  screen.getByRole('button', { name: 'Flip the character card' })

const swipe = (element: HTMLElement, dx: number, dy = 0) => {
  fireEvent.touchStart(element, { touches: [{ clientX: 200, clientY: 300 }] })
  fireEvent.touchEnd(element, {
    changedTouches: [{ clientX: 200 + dx, clientY: 300 + dy }],
  })
}

describe('CharacterCard', () => {
  it('shows the front: role, name, level and portrait', () => {
    renderWithProviders(<CharacterCard />)

    const name = screen.getByRole('heading', {
      level: 1,
      name: 'Marco Manduca',
    })
    expect(faceOf(name)).toHaveAttribute('aria-hidden', 'false')
    expect(
      screen.getByText('Data Engineer & Data Scientist'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Level: over 5 years of experience'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: 'Portrait of Marco Manduca' }),
    ).toBeInTheDocument()
  })

  it('flips to the back when the card is clicked', async () => {
    renderWithProviders(<CharacterCard />)
    const description = screen.getByText(/I design the path from raw data/)
    expect(faceOf(description)).toHaveAttribute('aria-hidden', 'true')

    await userEvent.click(cardControl())

    expect(faceOf(description)).toHaveAttribute('aria-hidden', 'false')
    const name = screen.getByRole('heading', {
      level: 1,
      name: 'Marco Manduca',
      hidden: true,
    })
    expect(faceOf(name)).toHaveAttribute('aria-hidden', 'true')
    expect(cardControl()).toHaveAttribute('aria-pressed', 'true')
  })

  it('flips on a horizontal swipe but not on a vertical scroll', () => {
    renderWithProviders(<CharacterCard />)

    swipe(cardControl(), 0, 120)
    expect(cardControl()).toHaveAttribute('aria-pressed', 'false')

    swipe(cardControl(), -80)
    expect(cardControl()).toHaveAttribute('aria-pressed', 'true')
  })

  it('ignores a short touch drag', () => {
    renderWithProviders(<CharacterCard />)

    swipe(cardControl(), 20)

    expect(cardControl()).toHaveAttribute('aria-pressed', 'false')
  })

  it('unlocks the curious figurine on the first flip', async () => {
    const { store } = renderWithProviders(<CharacterCard />)

    await userEvent.click(cardControl())

    expect(store.getState().game.unlocked).toContain('curious')
  })

  it('lists the skills and description on the back', () => {
    renderWithProviders(<CharacterCard />)

    expect(screen.getByText('Python · SQL')).toBeInTheDocument()
    expect(screen.getByText('AWS')).toBeInTheDocument()
    expect(screen.getByText('Power BI')).toBeInTheDocument()
  })

  it('flips back and forth with the keyboard', async () => {
    renderWithProviders(<CharacterCard />)
    cardControl().focus()

    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard('{Enter}')

    expect(cardControl()).toHaveAttribute('aria-pressed', 'false')
  })
})
